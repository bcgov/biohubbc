import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../../errors/http-error';
import { CSVValidationErrorResponse } from '../../../../../openapi/schemas/csv';
import { csvFileSchema } from '../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { ImportCapturesService } from '../../../../../services/import-services/capture/import-captures-service';
import { CSV_ERROR_MESSAGE } from '../../../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../../../utils/logger';
import { parseMulterFile } from '../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../utils/request';
import { constructXLSXWorkbook, getDefaultWorksheet } from '../../../../../utils/xlsx-utils/worksheet-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/captures/import');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [SURVEY_PERMISSION.COORDINATOR, SURVEY_PERMISSION.COLLABORATOR],
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
  importCaptureCSV()
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
    description: 'Critterbase Captures CSV import file.',
    required: true,
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
    201: {
      description: 'Captures import success.'
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
 * Imports a `Critterbase Capture CSV` which bulk adds captures to Critterbase.
 *
 * @return {*} {RequestHandler}
 */
export function importCaptureCSV(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const rawFile = getFileFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    const mediaFile = parseMulterFile(rawFile);
    const worksheet = getDefaultWorksheet(constructXLSXWorkbook(mediaFile));

    try {
      await connection.open();

      const importMarkings = new ImportCapturesService(connection, worksheet, surveyId);

      const errors = await importMarkings.importCSVWorksheet();

      if (errors.length) {
        throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
      }

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'importCritterCsv', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
