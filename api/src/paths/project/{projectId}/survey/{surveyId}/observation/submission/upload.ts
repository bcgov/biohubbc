import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../../../services/survey-service';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/upload');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  uploadMedia()
];

POST.apiDoc = {
  description: 'Upload survey observation submission file.',
  tags: ['attachments'],
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
    description: 'Survey observation submission file to upload',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              description: 'A survey observation submission file.',
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
              submissionId: {
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
      $ref: '#/components/responses/401'
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
 * Uploads a media file to S3 and inserts a matching record in the `occurrence_submission` table.
 *
 * @return {*}  {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
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

    try {
      const rawMediaFile = rawMediaArray[0];

      await connection.open();

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      const response = await insertSurveyOccurrenceSubmission(
        Number(req.params.surveyId),
        'BioHub',
        rawMediaFile.originalname,
        connection
      );

      const { submissionId } = response;

      const inputKey = generateS3FileKey({
        projectId: Number(req.params.projectId),
        surveyId: Number(req.params.surveyId),
        folder: `submissions/${submissionId}`,
        fileName: rawMediaFile.originalname
      });

      // Query to update the record with the inputKey before uploading the file
      await updateSurveyOccurrenceSubmissionWithKey(submissionId, inputKey, connection);

      await connection.commit();

      const metadata = {
        filename: rawMediaFile.originalname,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      await uploadFileToS3(rawMediaFile, inputKey, metadata);

      return res.status(200).send({ submissionId });
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Inserts a new record into the `occurrence_submission` table.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} inputFileName
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const insertSurveyOccurrenceSubmission = async (
  surveyId: number,
  source: string,
  inputFileName: string,
  connection: IDBConnection
): Promise<{ submissionId: number }> => {
  const surveyService = new SurveyService(connection);

  const response = await surveyService.insertSurveyOccurrenceSubmission({
    surveyId,
    source,
    inputFileName
  });

  if (!response.submissionId) {
    throw new HTTP400('Failed to insert survey occurrence submission record');
  }

  return response;
};

/**
 * Update existing `occurrence_submission` record with inputKey.
 *
 * @param {number} submissionId
 * @param {string} inputKey
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const updateSurveyOccurrenceSubmissionWithKey = async (
  submissionId: number,
  inputKey: string,
  connection: IDBConnection
): Promise<{ submissionId: number }> => {
  const surveyService = new SurveyService(connection);

  const response = await surveyService.updateSurveyOccurrenceSubmission({ submissionId, inputKey });

  if (!response.submissionId) {
    throw new HTTP400('Failed to update survey occurrence submission record');
  }

  return response;
};
