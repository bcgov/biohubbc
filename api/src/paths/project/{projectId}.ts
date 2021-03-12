import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { GetObjectivesData, GetProjectData, GetLocationData } from '../../models/project';
import { projectResponseBody } from '../../openapi/schemas/project';
import { getProjectSQL, getRegionsByProjectSQL } from '../../queries/project-queries';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}');

export const GET: Operation = [logRequest('paths/project/{projectId}', 'POST'), getProjectWithDetails()];

GET.apiDoc = {
  description: 'Fetch a project by its ID.',
  tags: ['project'],
  security: [
    {
      Bearer: READ_ROLES
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
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            ...(projectResponseBody as object)
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
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get a project by its id.
 *
 * @returns {RequestHandler}
 */
function getProjectWithDetails(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectSQLStatement = getProjectSQL(Number(req.params.projectId));
      const getRegionsByProjectSQLStatement = getRegionsByProjectSQL(Number(req.params.projectId));

      if (!getProjectSQLStatement || !getRegionsByProjectSQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      await connection.open();

      const [projectData, regionsData] = await Promise.all([
        await connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values),
        await connection.query(getRegionsByProjectSQLStatement.text, getRegionsByProjectSQLStatement.values)
      ]);

      defaultLog.debug({ label: 'getProjectWithDetails', message: 'test' });

      await connection.commit();

      const getProjectData = (projectData && projectData.rows && new GetProjectData(projectData.rows[0])) || null;
      const getObjectivesData = (projectData && projectData.rows && new GetObjectivesData(projectData.rows[0])) || null;
      const getLocationData =
        (projectData &&
          projectData.rows &&
          regionsData &&
          regionsData.rows &&
          new GetLocationData(projectData.rows[0], regionsData.rows)) ||
        null;

      const result = {
        id: req.params.projectId,
        project: getProjectData,
        objectives: getObjectivesData,
        location: getLocationData
      };

      defaultLog.debug('result:', result);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
