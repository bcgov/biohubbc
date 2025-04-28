import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../../errors/http-error';
import { CSVValidationErrorResponse } from '../../../../../openapi/schemas/csv';
import { csvFileSchema } from '../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { ImportMarkingsService } from '../../../../../services/import-services/marking/import-markings-service';
import { CSV_ERROR_MESSAGE } from '../../../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../../../utils/logger';
import { parseMulterFile } from '../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../utils/request';
import { constructXLSXWorkbook, getDefaultWorksheet } from '../../../../../utils/xlsx-utils/worksheet-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/markings/import');

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
  description: 'Upload Critterbase CSV Markings file',
  tags: ['observations'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      description: 'SIMS survey id',
      name: 'projectId',
      required: true,
      schema: {
        type: 'integer',
        minimum: 1
      }
    },
    {
      in: 'path',
      description: 'SIMS survey id',
      name: 'surveyId',
      required: true,
      schema: {
        type: 'integer',
        minimum: 1
      }
    }
  ],
  requestBody: {
    description: 'Critterbase Markings CSV import file.',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'Critterbase Markings CSV import file.',
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
    201: {
      description: 'Marking import success.'
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
 * Imports a `Critterbase Marking CSV` which bulk adds markings to Critterbase.
 *
 * @return {*} {RequestHandler}
 */
export function importCsv(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const rawFile = getFileFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    const mediaFile = parseMulterFile(rawFile);
    const worksheet = getDefaultWorksheet(constructXLSXWorkbook(mediaFile));

    try {
      await connection.open();

      const importMarkings = new ImportMarkingsService(connection, worksheet, surveyId);

      const errors = await importMarkings.importCSVWorksheet();

      if (errors.length) {
        throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
      }

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'importMarkingsCSV', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
