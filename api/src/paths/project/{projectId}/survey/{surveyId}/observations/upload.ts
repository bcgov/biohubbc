import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../database/db';
import { HTTP400, HTTP500 } from '../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../../services/survey-service';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';
import { ObservationService } from '../../../../../../services/observation-service';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/upload');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
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
 * Uploads a media file to S3 and inserts a matching record in the `occurrence_submission` table.
 * @TODO create a new table for occurrence submissions??
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

    if (rawMediaArray.length !== 1) {
      // no media objects included
      throw new HTTP400('Too many files uploaded, expected 1');
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

      // TODO
  
      const observationService = new ObservationService(connection);

      const submissionId = null; // TODO

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

