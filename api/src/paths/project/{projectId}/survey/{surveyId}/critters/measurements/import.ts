import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { csvFileSchema } from '../../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { importCSV } from '../../../../../../../services/import-services/import-csv';
import { ImportMeasurementsStrategy } from '../../../../../../../services/import-services/measurement/import-measurements-strategy';
import { getLogger } from '../../../../../../../utils/logger';
import { parseMulterFile } from '../../../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../../../utils/request';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/measurements/import');

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
  description: 'Upload Critterbase CSV Measurements file',
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
    description: 'Critterbase Measurements CSV import file.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'Critterbase Measurements CSV import file.',
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
      description: 'Measurement import success.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              measurementsCreated: {
                description: 'Number of Critterbase measurements created.',
                type: 'integer'
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
 * Imports a `Critterbase Measurement CSV` which bulk adds measurements to Critterbase.
 *
 * @return {*} {RequestHandler}
 */
export function importCsv(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const rawFile = getFileFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const importCsvMeasurementsStrategy = new ImportMeasurementsStrategy(connection, surveyId);

      // Pass CSV file and importer as dependencies
      const measurementsCreated = await importCSV(parseMulterFile(rawFile), importCsvMeasurementsStrategy);

      await connection.commit();

      return res.status(201).json({ measurementsCreated });
    } catch (error) {
      defaultLog.error({ label: 'importMeasurementsCSV', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
