import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ImportCrittersService } from '../../../../../../services/import-services/import-critters-service';
import { scanFileForVirus } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';
import { parseMulterFile } from '../../../../../../utils/media/media-utils';

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
    description: 'Survey critters submission file to import',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'Survey Critters submission import file.',
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
    const rawFiles = req.files as Express.Multer.File[];
    const rawFile = rawFiles[0];

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      if (rawFiles.length !== 1) {
        throw new HTTP400('Invalid number of files included. Expected 1 CSV file.');
      }

      if (!rawFile?.originalname.endsWith('.csv')) {
        throw new HTTP400('Invalid file type. Expected a CSV file.');
      }

      // Check for viruses / malware
      const virusScanResult = await scanFileForVirus(rawFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, import cancelled.');
      }

      const csvImporter = new ImportCrittersService(connection);

      // Pass the survey id and the csv (MediaFile) to the importer
      const surveyCritterIds = await csvImporter.import(surveyId, parseMulterFile(rawFile));

      defaultLog.info({ label: 'importCritterCsv', message: 'result', survey_critter_ids: surveyCritterIds });

      await connection.commit();

      return res.status(200).json({ survey_critter_ids: surveyCritterIds });
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
