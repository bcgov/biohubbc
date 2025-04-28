import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../errors/http-error';
import { CSVValidationErrorResponse } from '../../../../openapi/schemas/csv';
import { csvFileSchema } from '../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ImportObservationsService } from '../../../../services/import-services/observation/import-observations-service';
import { CSV_ERROR_MESSAGE } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../../utils/logger';
import { parseMulterFile } from '../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../utils/request';
import { constructXLSXWorkbook, getDefaultWorksheet } from '../../../../utils/xlsx-utils/worksheet-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/import');

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
  importObservationCSV()
];

POST.apiDoc = {
  description: 'Import survey observation CSV file.',
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
    description: 'Survey observation CSV file to import',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'A survey observation CSV file.',
              type: 'array',
              minItems: 1,
              maxItems: 1,
              items: csvFileSchema
            },
            surveySamplePeriodId: {
              description: 'The sample period id to associate the observations with.',
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
 * Imports a `Observation CSV` which bulk creates observations in SIMS.
 *
 * @return {*}  {RequestHandler}
 */
export function importObservationCSV(): RequestHandler {
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

      const importObserservations = new ImportObservationsService(
        connection,
        worksheet,
        surveyId,
        surveySamplePeriodId
      );

      const errors = await importObserservations.importCSVWorksheet();

      if (errors.length) {
        throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
      }

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'importObservationsCSV', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
