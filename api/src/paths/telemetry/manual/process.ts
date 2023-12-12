import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { TelemetryService } from '../../../services/telemetry-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('/api/telemetry/manual/process');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  processFile()
];

POST.apiDoc = {
  description: 'Processes and validates telemetry CSV submission',
  tags: ['survey', 'telemetry', 'csv'],
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
    description: 'Request body',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['submission_id'],
          properties: {
            submission_id: {
              description: 'The ID of the submission to validate',
              type: 'integer'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Validation results of the telemetry submission',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'A flag determining if the file was processed'
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

export function processFile(): RequestHandler {
  return async (req, res) => {
    const submissionId = req.body.submission_id;

    const connection = getDBConnection(req['keycloak_token']);
    try {
      await connection.open();

      const service = new TelemetryService(connection);

      await service.processTelemetryCsvSubmission(submissionId);

      res.status(200).json({ success: true });

      await connection.commit();
    } catch (error) {
      defaultLog.error({ label: 'processFile', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
