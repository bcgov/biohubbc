import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { PermitService } from '../../../../../../../services/permit-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{projectId}/permit/{permitId}/delete');

export const DELETE: Operation = [
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
  deleteSurveyPermit()
];

DELETE.apiDoc = {
  description: 'Delete a survey permit.',
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
    },
    {
      in: 'path',
      name: 'permitId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Permit DELETE response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey permit delete Response Object',
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

export function deleteSurveyPermit(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const permitId = Number(req.params.permitId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const permitService = new PermitService(connection);

      const permit_id = await permitService.deleteSurveyPermit(surveyId, permitId);

      await connection.commit();

      return res.status(200).json({ permit_id: permit_id });
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveyPermit', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
