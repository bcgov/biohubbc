import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../../errors/http-error';
import { CSVValidationErrorResponse } from '../../../../../openapi/schemas/csv';
import { csvFileSchema } from '../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { ImportMortalitiesService } from '../../../../../services/import-services/mortality/import-mortality-service';
import { CSV_ERROR_MESSAGE } from '../../../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../../../utils/logger';
import { parseMulterFile } from '../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../utils/request';
import { constructXLSXWorkbook, getDefaultWorksheet } from '../../../../../utils/xlsx-utils/worksheet-utils';

const defaultLog = getLogger('/api/survey/{surveyId}/mortality/import');

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
  importMortalityCSV()
];

POST.apiDoc = {
  description: 'Upload Critterbase CSV Mortality file',
  tags: ['mortality'],
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
    description: 'Critterbase Mortality CSV import file.',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'Critterbase Mortality CSV import file.',
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
      description: 'Mortality import success.'
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
 * Imports a `Critterbase Mortality CSV` which bulk adds mortalities to Critterbase.
 *
 * @return {*} {RequestHandler}
 */
export function importMortalityCSV(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const rawFile = getFileFromRequest(req);
    const connection = getDBConnection(req.keycloak_token);
    const mediaFile = parseMulterFile(rawFile);
    const worksheet = getDefaultWorksheet(constructXLSXWorkbook(mediaFile));
    try {
      await connection.open();
      const importMarkings = new ImportMortalitiesService(connection, worksheet, surveyId);
      const errors = await importMarkings.importCSVWorksheet();
      if (errors.length) {
        throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
      }
      await connection.commit();
      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'importMMortalityCsv', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
