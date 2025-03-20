import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../../../errors/http-error';
import { CSVValidationErrorResponse } from '../../../../../../openapi/schemas/csv';
import { csvFileSchema } from '../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ImportHabitatFeaturesService } from '../../../../../../services/import-services/habitat-feature/import-habitat-features-service';
import { CSV_ERROR_MESSAGE } from '../../../../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../../../../utils/logger';
import { parseMulterFile } from '../../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../../utils/request';
import { constructXLSXWorkbook, getDefaultWorksheet } from '../../../../../../utils/xlsx-utils/worksheet-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/habitat-features/import');

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
  importHabitatFeatureCSV()
];

POST.apiDoc = {
  description: 'Import survey habitat feature CSV file.',
  tags: ['habitat-feature'],
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
    description: 'Survey habitat feature CSV file to import',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'A survey habitat feature CSV file.',
              type: 'array',
              minItems: 1,
              maxItems: 1,
              items: csvFileSchema
            },
            surveySamplePeriodId: {
              description: 'The sample period id to associate the habitat features with.',
              // Intentionally using string as `formData` only supports string / binary values
              type: 'string',
              format: 'number',
              minimum: 1
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Habitat feature import success.'
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
 * Imports a `Habitat Feature CSV` which bulk creates habitat features in SIMS.
 *
 * @return {*}  {RequestHandler}
 */
export function importHabitatFeatureCSV(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveySamplePeriodId = req.body.surveySamplePeriodId ? Number(req.body.surveySamplePeriodId) : undefined;

    const rawFile = getFileFromRequest(req);
    const mediaFile = parseMulterFile(rawFile);
    const workbook = constructXLSXWorkbook(mediaFile);
    const worksheet = getDefaultWorksheet(workbook);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const importHabitatFeaturesService = new ImportHabitatFeaturesService(
        connection,
        worksheet,
        surveyId,
        surveySamplePeriodId
      );

      const errors = await importHabitatFeaturesService.importCSVWorksheet();

      if (errors.length) {
        throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
      }

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'importHabitatFeatureCSV', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
