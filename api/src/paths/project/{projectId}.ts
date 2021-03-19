import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import {
  GetObjectivesData,
  GetProjectData,
  GetLocationData,
  GetCoordinatorData,
  GetIUCNClassificationData,
  GetFundingData,
  GetSpeciesData
} from '../../models/project';
import { projectResponseBody } from '../../openapi/schemas/project';
import {
  getActivitiesByProjectSQL,
  getClimateInitiativesByProjectSQL,
  getProjectSQL,
  getRegionsByProjectSQL,
  getIUCNActionClassificationByProjectSQL,
  getFundingSourceByProjectSQL,
  getFocalSpeciesByProjectSQL,
  getAncillarySpeciesByProjectSQL
} from '../../queries/project-queries';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';
import { CustomError } from '../../errors/CustomError';

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
            // TODO update with an object that represents the real response
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
      const getProjectFocalSpeciesSQLStatement = getFocalSpeciesByProjectSQL(Number(req.params.projectId));
      const getProjectAncillarySpeciesSQLStatement = getAncillarySpeciesByProjectSQL(Number(req.params.projectId));
      const getProjectIUCNActionClassificationSQLStatement = getIUCNActionClassificationByProjectSQL(
        Number(req.params.projectId)
      );
      const getProjectFundingSourceSQLStatement = getFundingSourceByProjectSQL(Number(req.params.projectId));

      if (
        !getProjectSQLStatement ||
        !getRegionsByProjectSQLStatement ||
        !getProjectActivitiesSQLStatement ||
        !getProjectClimateInitiativesSQLStatement ||
        !getProjectIUCNActionClassificationSQLStatement ||
        !getProjectFundingSourceSQLStatement ||
        !getProjectFocalSpeciesSQLStatement ||
        !getProjectAncillarySpeciesSQLStatement
      ) {
        throw new CustomError(400, 'Failed to build SQL statement');
      }

      await connection.open();

      const [
        projectData,
        regionsData,
        activityData,
        climateInitiativeData,
        iucnClassificationData,
        fundingData,
        focalSpecies,
        ancillarySpecies
      ] = await Promise.all([
        await connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values),
        await connection.query(getRegionsByProjectSQLStatement.text, getRegionsByProjectSQLStatement.values),
        await connection.query(getProjectActivitiesSQLStatement.text, getProjectActivitiesSQLStatement.values),
        await connection.query(
          getProjectClimateInitiativesSQLStatement.text,
          getProjectClimateInitiativesSQLStatement.values
        ),
        await connection.query(getProjectFocalSpeciesSQLStatement.text, getProjectFocalSpeciesSQLStatement.values),
        await connection.query(
          getProjectAncillarySpeciesSQLStatement.text,
          getProjectAncillarySpeciesSQLStatement.values
        ),
        await connection.query(
          getProjectIUCNActionClassificationSQLStatement.text,
          getProjectIUCNActionClassificationSQLStatement.values
        ),
        await connection.query(getProjectFundingSourceSQLStatement.text, getProjectFundingSourceSQLStatement.values)
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

      const getCoordinatorData =
        (projectData && projectData.rows && new GetCoordinatorData(projectData.rows[0])) || null;

      const getSpeciesData =
        (focalSpecies &&
          focalSpecies.rows &&
          ancillarySpecies &&
          ancillarySpecies.rows &&
          new GetSpeciesData(focalSpecies.rows, ancillarySpecies.rows)) ||
        null;

      const getIUCNClassificationData =
        (iucnClassificationData &&
          iucnClassificationData.rows &&
          new GetIUCNClassificationData(iucnClassificationData.rows)) ||
        null;

      const getFundingData = (fundingData && fundingData.rows && new GetFundingData(fundingData.rows)) || null;

      const result = {
        id: req.params.projectId,
        project: getProjectData,
        coordinator: getCoordinatorData,
        objectives: getObjectivesData,
        location: getLocationData,
        iucn: getIUCNClassificationData,
        funding: getFundingData,
        species: getSpeciesData
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
