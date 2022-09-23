import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { PermitService } from '../../../../../../services/permit-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{projectId}/permit/create');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  createSurveyPermit()
];

POST.apiDoc = {
  description: 'Create a survey permit.',
  tags: ['permits'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Permit POST request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Permit create request object',
          type: 'object',
          required: ['permit'],
          properties: {
            permit: {
              type: 'object',
              required: ['permit_number', 'permit_type'],
              properties: {
                permit_number: {
                  type: 'string'
                },
                permit_type: {
                  type: 'string'
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
      description: 'Permit POST response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Permit create Response Object',
            type: 'object',
            required: ['permit_id'],
            properties: {
              permit_id: {
                type: 'number'
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
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function createSurveyPermit(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const permitNumber = String(req.body.permit.permit_number);
    const permitType = String(req.body.permit.permit_type);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const permitService = new PermitService(connection);

      const permit_id = await permitService.createSurveyPermit(surveyId, permitNumber, permitType);

      await connection.commit();

      return res.status(200).json({ permit_id: permit_id });
    } catch (error) {
      defaultLog.error({ label: 'createSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
