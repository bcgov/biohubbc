import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { scanFileForVirus } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';
import { MediaFile } from '../../../../../../utils/media/media-file';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/critters/import');

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
  importCsv()
];

POST.apiDoc = {
  description: 'Upload survey critters submission file',
  tags: ['observations'],
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
    description: 'Survey critters submission file to import',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'A survey critters submission file.',
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
            additionalProperties: false,
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
 * Uploads a media file to S3 and inserts a matching record in the `survey_observation_submission` table.
 *
 * @return {*}  {RequestHandler}
 */
export function importCsv(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const files = req.files as Express.Multer.File[];
    const rawFile = files[0];

    const connection = getDBConnection(req['keycloak_token']);

    const surveyCritterService = new SurveyCritterService(connection);

    try {
      await connection.open();

      if (files?.length !== 1) {
        throw new HTTP400('Invalid amount of files. Expected single CSV file.');
      }

      if (!rawFile?.originalname.endsWith('.csv')) {
        throw new HTTP400('Invalid file type. Expected a CSV file.');
      }

      const virusScanResult = await scanFileForVirus(rawFile);

      // Check for viruses
      if (virusScanResult) {
        throw new HTTP400('Malicious content detected, import cancelled.');
      }

      const mediaFile = new MediaFile(rawFile.filename, rawFile.mimetype, rawFile.buffer);

      // Validate the critters CSV
      const csvCritters = await surveyCritterService.validateCritterCsvForImport(surveyId, mediaFile);

      // Import the critters into SIMS and Critterbase
      const critters = await surveyCritterService.importCsvCritters(surveyId, csvCritters);

      defaultLog.info({ label: 'importCritterCsv', message: 'result', result: critters });

      await connection.commit();

      return res.status(200).json({ critters });
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
