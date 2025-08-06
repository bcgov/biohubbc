import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../errors/http-error';
import { CSVValidationErrorResponse } from '../../../../openapi/schemas/csv';
import { csvFileSchema } from '../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ImportDeviceService } from '../../../../services/import-services/devices/import-device-service';
import { CSV_ERROR_MESSAGE } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { parseMulterFile } from '../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../utils/request';
import { constructXLSXWorkbook, getDefaultWorksheet } from '../../../../utils/xlsx-utils/worksheet-utils';

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
  importTelemetryDeviceCSV()
];

POST.apiDoc = {
  description: 'Upload survey telemetry device submission file.',
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
    description: 'Survey telemetry device submission file to upload',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'A survey telemetry device submission file.',
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
 * Imports telemetry devices from a CSV file.
 *
 * @return {*}  {RequestHandler}
 */
export function importTelemetryDeviceCSV(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const rawFile = getFileFromRequest(req);

      const mediaFile = parseMulterFile(rawFile);
      const worksheet = getDefaultWorksheet(constructXLSXWorkbook(mediaFile));

      const deviceService = new ImportDeviceService(connection, worksheet, surveyId);

      const errors = await deviceService.importCSVWorksheet();

      if (errors.length) {
        throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
      }

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
