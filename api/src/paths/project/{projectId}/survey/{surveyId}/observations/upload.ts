import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../../../errors/http-error';
import { CSVValidationErrorResponse } from '../../../../../../openapi/schemas/csv';
import { csvFileSchema } from '../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ImportObservationsService } from '../../../../../../services/import-services/observation/import-observations-service';
import { CSV_ERROR_MESSAGE } from '../../../../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../../../../utils/logger';
import { parseMulterFile } from '../../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../../utils/request';
import { constructXLSXWorkbook, getDefaultWorksheet } from '../../../../../../utils/xlsx-utils/worksheet-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/upload');

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
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'A survey observation submission file.',
              type: 'array',
              minItems: 1,
              maxItems: 1,
              items: csvFileSchema
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Observation import success.'
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
    422: CSVValidationErrorResponse,
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
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const rawFile = getFileFromRequest(req);
    const mediaFile = parseMulterFile(rawFile);
    const workbook = constructXLSXWorkbook(mediaFile);
    const worksheet = getDefaultWorksheet(workbook);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const importMarkings = new ImportObservationsService(connection, worksheet, surveyId);

      const errors = await importMarkings.importCSVWorksheet();

      if (errors.length) {
        throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
      }

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'importMarkingsCSV', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
