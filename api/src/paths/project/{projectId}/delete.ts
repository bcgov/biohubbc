import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ProjectService } from '../../../services/project-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteProject()
];

DELETE.apiDoc = {
  description: 'Delete a project.',
  tags: ['project'],
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
        type: 'number'
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
            title: 'Project delete response',
            type: 'boolean'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function deleteProject(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete project', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param: `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);
    const projectId = Number(req.params.projectId);
    const userRoles = req['system_user']['role_names'];

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const resp = await projectService.deleteProject(projectId, userRoles);

      await connection.commit();

      return res.status(200).json(resp);
    } catch (error) {
      defaultLog.error({ label: 'deleteProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
