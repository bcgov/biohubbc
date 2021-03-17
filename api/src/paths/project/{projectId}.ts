import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { GetObjectivesData, GetProjectData, GetLocationData, GetCoordinatorData } from '../../models/project';
import { projectResponseBody } from '../../openapi/schemas/project';
import {
  getActivitiesByProjectSQL,
  getClimateInitiativesByProjectSQL,
  getProjectSQL,
  getRegionsByProjectSQL
} from '../../queries/project-queries';
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
      const getProjectActivitiesSQLStatement = getActivitiesByProjectSQL(Number(req.params.projectId));
      const getProjectClimateInitiativesSQLStatement = getClimateInitiativesByProjectSQL(Number(req.params.projectId));

      if (
        !getProjectSQLStatement ||
        !getRegionsByProjectSQLStatement ||
        !getProjectActivitiesSQLStatement ||
        !getProjectClimateInitiativesSQLStatement
      ) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      await connection.open();

      const [projectData, regionsData, activityData, climateInitiativeData] = await Promise.all([
        await connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values),
        await connection.query(getRegionsByProjectSQLStatement.text, getRegionsByProjectSQLStatement.values),
        await connection.query(getProjectActivitiesSQLStatement.text, getProjectActivitiesSQLStatement.values),
        await connection.query(
          getProjectClimateInitiativesSQLStatement.text,
          getProjectClimateInitiativesSQLStatement.values
        )
      ]);

      await connection.commit();

      const getProjectData =
        (projectData &&
          projectData.rows &&
          activityData &&
          activityData.rows &&
          climateInitiativeData &&
          climateInitiativeData.rows &&
          new GetProjectData(projectData.rows[0], activityData.rows, climateInitiativeData.rows)) ||
        null;
      const getObjectivesData = (projectData && projectData.rows && new GetObjectivesData(projectData.rows[0])) || null;
      const getLocationData =
        (projectData &&
          projectData.rows &&
          regionsData &&
          regionsData.rows &&
          new GetLocationData(projectData.rows[0], regionsData.rows)) ||
        null;

        const getCoordinatorData = (projectData && projectData.rows && new GetCoordinatorData(projectData.rows[0])) || null;

      const result = {
        id: req.params.projectId,
        project: getProjectData,
        objectives: getObjectivesData,
        location: getLocationData,
        coordinator: getCoordinatorData
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
