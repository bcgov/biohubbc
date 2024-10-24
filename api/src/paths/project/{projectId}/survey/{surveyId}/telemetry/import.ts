import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { csvFileSchema } from '../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { importCSV } from '../../../../../../services/import-services/import-csv';
import { ImportTelemetryStrategy } from '../../../../../../services/import-services/telemetry/import-telemetry-strategy';
import { getLogger } from '../../../../../../utils/logger';
import { parseMulterFile } from '../../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../../utils/request';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/telemetry/upload');

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
  importTelemetryCSV()
];

POST.apiDoc = {
  description: 'Upload survey telemetry submission file.',
  tags: ['telemetry'],
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
    description: 'Survey telemetry submission file to upload',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'A survey telemetry submission file.',
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
 * Imports manual telemetry from a CSV file.
 *
 * @return {*}  {RequestHandler}
 */
export function importTelemetryCSV(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const rawMediaFile = getFileFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryStrategy = new ImportTelemetryStrategy(connection, surveyId);

      // Pass CSV file and importer as dependencies
      await importCSV(parseMulterFile(rawMediaFile), telemetryStrategy);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'importTelemetry', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
