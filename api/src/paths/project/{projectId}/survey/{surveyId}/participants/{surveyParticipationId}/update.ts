import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/participants/{surveyParticipationId}/update');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  updateSurveyParticipantRole()
];

PUT.apiDoc = {
  description: 'Update a survey participant role.',
  tags: ['survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyParticipationId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {}
      }
    }
  },
  responses: {
    200: {
      description: 'Update survey participant role OK'
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

export function updateSurveyParticipantRole(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSurveyParticipantRole', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
