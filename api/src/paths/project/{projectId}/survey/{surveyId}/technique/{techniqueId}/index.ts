import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { TechniqueService } from '../../../../../../../services/technique-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/technique/{techniqueId}/index');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
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
  deleteTechnique()
];

DELETE.apiDoc = {
  description: 'Delete a technique from a Survey.',
  tags: ['technique'],
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
      name: 'techniqueId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Boolean true value representing successful deletion.',
      content: {
        'application/json': {
          schema: {
            title: 'Technique delete response',
            type: 'boolean'
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

/**
 * Delete a technique from a Survey
 *
 * @returns {RequestHandler}
 */
export function deleteTechnique(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    if (!req.params.techniqueId) {
      throw new HTTP400('Missing required param `techniqueId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const techniqueId = Number(req.params.techniqueId);

      const techniqueService = new TechniqueService(connection);

      const method_technique_id = await techniqueService.deleteTechnique(techniqueId);

      await connection.commit();

      return res.status(200).json(Boolean(method_technique_id));
    } catch (error) {
      defaultLog.error({ label: 'getSurveyTechniques', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
