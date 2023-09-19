import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters/{critterId}');
export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  removeCritterFromSurvey()
];

DELETE.apiDoc = {
  description: 'Removes association of this critter to this survey.',
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
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'string'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Responds with affected number of rows.',
      content: {
        'application/json': {
          schema: {
            title: 'Affected rows',
            type: 'number'
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

export function removeCritterFromSurvey(): RequestHandler {
  return async (req, res) => {
    const critterId = Number(req.params.critterId);
    const connection = getDBConnection(req['keycloak_token']);
    const surveyService = new SurveyCritterService(connection);
    try {
      await connection.open();
      const result = await surveyService.removeCritterFromSurvey(critterId);
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
