import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { getLogger } from '../../../../../../utils/logger';
import { surveyObservationsResponseSchema } from './index';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/process');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          surveyId: Number(req.body.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  processFile()
];

POST.apiDoc = {
  description: 'Processes and validates observation CSV submission',
  tags: ['survey', 'observation', 'csv'],
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
          required: ['observation_submission_id'],
          properties: {
            observation_submission_id: {
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
      description: 'Validation results of the observation submission',
      content: {
        'application/json': {
          schema: {
            ...surveyObservationsResponseSchema
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
    const submissionId = req.body.observation_submission_id;

    const connection = getDBConnection(req['keycloak_token']);
    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const response = await observationService.processObservationCsvSubmission(submissionId);

      res.status(200).json({ surveyObservations: response });

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
