import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { ApiGeneralError } from '../../../../../../../../errors/api-error';
import { HTTP400 } from '../../../../../../../../errors/http-error';
import { csvFileSchema } from '../../../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { ImportCapturesService } from '../../../../../../../../services/import-services/capture/import-captures-service';
import { importCSV } from '../../../../../../../../services/import-services/csv-import-strategy';
import { SurveyCritterService } from '../../../../../../../../services/survey-critter-service';
import { scanFileForVirus } from '../../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../../utils/logger';
import { parseMulterFile } from '../../../../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../../../../utils/request';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/{critterId}/captures/import');

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
  description: 'Upload Critterbase CSV Captures file',
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
    },
    {
      in: 'path',
      description: 'SIMS survey critter id.',
      name: 'critterId',
      required: true
    }
  ],
  requestBody: {
    description: 'Critterbase Captures CSV import file.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'Critterbase Captures CSV import file.',
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
      description: 'Import OK'
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
 * Imports a `Critterbase Capture CSV` which bulk adds captures to Critterbase.
 *
 * @return {*} {RequestHandler}
 */
export function importCsv(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const critterId = Number(req.params.critterId);
    const rawFile = getFileFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      // Check for viruses / malware
      const virusScanResult = await scanFileForVirus(rawFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, import cancelled.');
      }

      const surveyCritterService = new SurveyCritterService(connection);

      // Fetch the survey critter
      const surveyCritter = await surveyCritterService.getCritterInSurvey(surveyId, critterId);

      if (!surveyCritter) {
        throw new ApiGeneralError(`Unable to find critter in survey.`, [{ surveyId, critterId }]);
      }

      const importCsvCaptures = new ImportCapturesService(connection, surveyCritter.critterbase_critter_id);

      await importCSV(parseMulterFile(rawFile), importCsvCaptures);

      await connection.commit();

      return res.status(200);
    } catch (error) {
      defaultLog.error({ label: 'importCritterCsv', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
