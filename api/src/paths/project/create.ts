import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { PostProjectObject } from '../../models/project-create';
import { projectCreatePostRequestObject, projectIdResponseObject } from '../../openapi/schemas/project';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ProjectService } from '../../services/project-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/project');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  createProject()
];

POST.apiDoc = {
  description: 'Create a new Project.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Project post request object.',
    content: {
      'application/json': {
        schema: {
          ...(projectCreatePostRequestObject as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            ...(projectIdResponseObject as object)
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

/**
 * Creates a new project record.
 *
 * @returns {RequestHandler}
 */
export function createProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedProjectPostData = new PostProjectObject(req.body);

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const projectId = await projectService.createProject(sanitizedProjectPostData);

      await connection.commit();

      return res.status(200).json({ id: projectId });
    } catch (error) {
      defaultLog.error({ label: 'createProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
