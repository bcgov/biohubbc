import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/process');

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
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['observation_submission_id'],
          properties: {
            observation_submission_id: {
              description: 'The ID of the submission to validate',
              type: 'integer'
            },
            options: {
              type: 'object',
              additionalProperties: false,
              properties: {
                surveySamplePeriodId: {
                  type: 'integer',
                  description:
                    'The optional ID of a survey sample period to associate the parsed observation records with.'
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Process Observation File OK'
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
    const surveyId = Number(req.params.surveyId);
    const submissionId = req.body.observation_submission_id;

    const connection = getDBConnection(req.keycloak_token);
    try {
      await connection.open();

      const options = req.body.options || undefined;

      const observationService = new ObservationService(connection);

      await observationService.processObservationCsvSubmission(surveyId, submissionId, options);

      await connection.commit();

      res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'processFile', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
