import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../errors/http-error';
import { CSVValidationErrorResponse } from '../../../../openapi/schemas/csv';
import { csvFileSchema } from '../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ImportSamplePeriodsService } from '../../../../services/import-services/sampling-periods/import-sample-periods-service';
import { CSV_ERROR_MESSAGE } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../../utils/logger';
import { parseMulterFile } from '../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../utils/request';
import { constructXLSXWorkbook, getDefaultWorksheet } from '../../../../utils/xlsx-utils/worksheet-utils';

const defaultLog = getLogger('/api/survey/{surveyId}/sample-period/import');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  importSamplePeriodsCSV()
];

POST.apiDoc = {
  description: 'Import SIMS CSV Sample periods CSV file',
  tags: ['periods'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
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
    description: 'SIMS sample period CSV import file.',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'SIMS sample period CSV import file.',
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
      description: 'Sample periods CSV import success.'
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
 * Imports a `Sample Period CSV` which bulk adds sample periods into SIMS.
 *
 * @return {*} {RequestHandler}
 */
export function importSamplePeriodsCSV(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const rawFile = getFileFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    const mediaFile = parseMulterFile(rawFile);
    const worksheet = getDefaultWorksheet(constructXLSXWorkbook(mediaFile));

    try {
      await connection.open();

      const importSamplePeriods = new ImportSamplePeriodsService(connection, worksheet, surveyId);

      const errors = await importSamplePeriods.importCSVWorksheet();

      if (errors.length) {
        throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
      }

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'importSamplePeriodsCSV', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
