import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { SUMMARY_SUBMISSION_MESSAGE_TYPE } from '../../../../../../../constants/status';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SummaryService } from '../../../../../../../services/summary-service';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';
import { MessageError, SummarySubmissionError } from '../../../../../../../utils/submission-error';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/summary/upload');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  uploadAndValidate()
];

POST.apiDoc = {
  description: 'Upload survey summary results file.',
  tags: ['results'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      required: true
    }
  ],
  requestBody: {
    description: 'Survey summary results file to upload',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              description: 'A survey summary file.',
              type: 'string',
              format: 'binary'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Upload OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              summarySubmissionId: {
                type: 'number'
              }
            }
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Uploads a media file to S3 and inserts a matching record in the `summary_submission` table,
 * then validates the submission.
 *
 * @return {*}  {RequestHandler}
 */
export function uploadAndValidate(): RequestHandler {
  return async (req, res) => {
    const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];

    if (!rawMediaArray || !rawMediaArray.length) {
      // no media objects included, skipping media upload step
      throw new HTTP400('Missing upload data');
    }

    defaultLog.debug({
      label: 'uploadMedia',
      message: 'files',
      files: rawMediaArray.map((item) => {
        return { ...item, buffer: 'Too big to print' };
      })
    });

    if (rawMediaArray.length !== 1) {
      // no media objects included
      throw new HTTP400('Too many files uploaded, expected 1');
    }

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param: projectId');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param: surveyId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    let summarySubmissionId: number | null = null;

    try {
      const rawMediaFile = rawMediaArray[0];

      await connection.open();
      const summaryService = new SummaryService(connection);

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      const surveyId = Number(req.params.surveyId);
      summarySubmissionId = (
        await summaryService.insertSurveySummarySubmission(surveyId, 'BioHub', rawMediaFile.originalname)
      ).survey_summary_submission_id;

      const key = generateS3FileKey({
        projectId: Number(req.params.projectId),
        surveyId: surveyId,
        folder: `summaryresults/${summarySubmissionId}`,
        fileName: rawMediaFile.originalname
      });

      await summaryService.updateSurveySummarySubmissionWithKey(summarySubmissionId, key);

      await connection.commit();

      const metadata = {
        filename: rawMediaFile.originalname,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      // Upload submission to S3
      await uploadFileToS3(rawMediaFile, key, metadata);

      // Validate submission
      await summaryService.validateFile(summarySubmissionId, surveyId);

      return res.status(200).json({ summarySubmissionId });
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();

      // Log error in summary submission error messages table
      if (summarySubmissionId) {
        const summaryService = new SummaryService(connection);
        await summaryService.insertSummarySubmissionError(
          summarySubmissionId,
          new SummarySubmissionError({
            messages: [new MessageError(SUMMARY_SUBMISSION_MESSAGE_TYPE.SYSTEM_ERROR)]
          })
        );
      }
      throw error;
    } finally {
      connection.release();
    }
  };
}
