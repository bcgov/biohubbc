import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { csvFileSchema } from '../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ImportCrittersStrategy } from '../../../../../../services/import-services/critter/import-critters-strategy';
import { importCSV } from '../../../../../../services/import-services/import-csv';
import { getLogger } from '../../../../../../utils/logger';
import { parseMulterFile } from '../../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../../utils/request';

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
  tags: ['critterbase', 'survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true,
      schema: {
        type: 'integer',
        minimum: 1
      }
    },
    {
      in: 'path',
      name: 'surveyId',
      required: true,
      schema: {
        type: 'integer',
        minimum: 1
      }
    }
  ],
  requestBody: {
    description: 'Survey critters csv file to import',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'Critter CSV import file.',
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
    200: {
      description: 'Import OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['survey_critter_ids'],
            properties: {
              survey_critter_ids: {
                type: 'array',
                items: {
                  type: 'integer',
                  minimum: 1
                }
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
 * Imports a `Critter CSV` which adds critters to `survey_critter` table and creates critters in Critterbase.
 *
 * @return {*}  {RequestHandler}
 */
export function importCsv(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const rawFile = getFileFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      // Critter CSV import strategy - child of CSVImportStrategy
      const importCsvCritters = new ImportCrittersStrategy(connection, surveyId);

      const surveyCritterIds = await importCSV(parseMulterFile(rawFile), importCsvCritters);

      defaultLog.info({ label: 'importCritterCsv', message: 'result', survey_critter_ids: surveyCritterIds });

      await connection.commit();

      return res.status(200).json({ survey_critter_ids: surveyCritterIds });
    } catch (error) {
      defaultLog.error({ label: 'importCritterCsv', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
