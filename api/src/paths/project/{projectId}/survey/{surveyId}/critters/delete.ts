import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters/delete');

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
  removeCrittersFromSurvey()
];

POST.apiDoc = {
  description: 'Removes association of these critters to this survey.',
  tags: ['critterbase'],
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
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Array of survey critter Ids to be deleted',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            critterIds: {
              type: 'array',
              items: {
                type: 'integer',
                description: 'Survey critter Id'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Critter was removed from survey'
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

export function removeCrittersFromSurvey(): RequestHandler {
  return async (req, res) => {
    const critterIds = req.body.critterIds;
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);
    const surveyCritterService = new SurveyCritterService(connection);

    try {
      await connection.open();

      const result = await surveyCritterService.removeCrittersFromSurvey(surveyId, critterIds);
      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'removeCritterFromSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
