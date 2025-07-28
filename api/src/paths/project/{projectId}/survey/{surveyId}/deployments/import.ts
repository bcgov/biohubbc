import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../../../errors/http-error';
import { CSVValidationErrorResponse } from '../../../../../../openapi/schemas/csv';
import { csvFileSchema } from '../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ImportDeploymentService } from '../../../../../../services/import-services/deployments/import-deployment-service';
import { CSV_ERROR_MESSAGE } from '../../../../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../../../../utils/logger';
import { parseMulterFile } from '../../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../../utils/request';
import { constructXLSXWorkbook, getDefaultWorksheet } from '../../../../../../utils/xlsx-utils/worksheet-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/deployments/import');

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
  importDeploymentCSV()
];

POST.apiDoc = {
  description: 'Upload survey deployment submission file.',
  tags: ['deployment'],
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
    description: 'Survey deployment submission file to upload',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'A survey deployment submission file.',
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
 * Imports deployments from a CSV file.
 *
 * @return {*}  {RequestHandler}
 */
export function importDeploymentCSV(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const rawFile = getFileFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    const mediaFile = parseMulterFile(rawFile);
    const worksheet = getDefaultWorksheet(constructXLSXWorkbook(mediaFile));

    try {
      await connection.open();

      const deploymentService = new ImportDeploymentService(connection, worksheet, surveyId);

      const errors = await deploymentService.importCSVWorksheet();

      if (errors.length) {
        throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
      }

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      if (error instanceof HTTP422CSVValidationError === false) {
        defaultLog.error({ label: 'importDeployment', message: 'error', error });
      }

      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
