import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../database/db';
import { projectIdResponseObject } from '../../../openapi/schemas/project';
import { ProjectService } from '../../../services/project-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/public/projects');

export const GET: Operation = [getPublicProjectsList()];

GET.apiDoc = {
  description: 'Gets a list of public facing (published) projects.',
  tags: ['public', 'projects'],
  responses: {
    200: {
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              ...(projectIdResponseObject as object)
            }
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
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
 * Get all public facing (published) projects.
 *
 * @returns {RequestHandler}
 */
export function getPublicProjectsList(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const projects = await projectService.getPublicProjectsList();

      await connection.commit();

      return res.status(200).json(projects);
    } catch (error) {
      defaultLog.error({ label: 'getPublicProjectsList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
