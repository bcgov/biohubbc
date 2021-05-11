import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/CustomError';
import {
  GetCoordinatorData,
  GetIUCNClassificationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetProjectData,
  GetLocationData,
  GetPermitData
} from '../../../models/project-view';
import { GetSpeciesData, GetFundingData } from '../../../models/project-view-update';
import { projectViewGetResponseObject } from '../../../openapi/schemas/project';
import {
  getIndigenousPartnershipsByProjectSQL,
  getIUCNActionClassificationByProjectSQL,
  getProjectSQL,
  getProjectPermitsSQL
} from '../../../queries/project/project-view-queries';
import {
  getStakeholderPartnershipsByProjectSQL,
  getFocalSpeciesByProjectSQL,
  getAncillarySpeciesByProjectSQL,
  getLocationByProjectSQL,
  getActivitiesByProjectSQL,
  getFundingSourceByProjectSQL
} from '../../../queries/project/project-view-update-queries';
import { getLogger } from '../../../utils/logger';
import { logRequest } from '../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}/view');

export const GET: Operation = [logRequest('paths/project/{projectId}/view', 'GET'), getProjectForView()];

GET.apiDoc = {
  description: 'Get a project, for view-only purposes.',
  tags: ['project'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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
            ...(projectViewGetResponseObject as object)
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
 * Get a project by its id.
 *
 * @returns {RequestHandler}
 */
function getProjectForView(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectSQLStatement = getProjectSQL(Number(req.params.projectId));
      const getProjectPermitsSQLStatement = getProjectPermitsSQL(Number(req.params.projectId));
      const getProjectLocationSQLStatement = getLocationByProjectSQL(Number(req.params.projectId));
      const getProjectActivitiesSQLStatement = getActivitiesByProjectSQL(Number(req.params.projectId));
      const getProjectIUCNActionClassificationSQLStatement = getIUCNActionClassificationByProjectSQL(
        Number(req.params.projectId)
      );
      const getProjectFundingSourceSQLStatement = getFundingSourceByProjectSQL(Number(req.params.projectId));
      const getProjectFocalSpeciesSQLStatement = getFocalSpeciesByProjectSQL(Number(req.params.projectId));
      const getProjectAncillarySpeciesSQLStatement = getAncillarySpeciesByProjectSQL(Number(req.params.projectId));
      const getProjectIndigenousPartnershipsSQLStatement = getIndigenousPartnershipsByProjectSQL(
        Number(req.params.projectId)
      );
      const getProjectStakeholderPartnershipsSQLStatement = getStakeholderPartnershipsByProjectSQL(
        Number(req.params.projectId)
      );

      if (
        !getProjectSQLStatement ||
        !getProjectPermitsSQLStatement ||
        !getProjectLocationSQLStatement ||
        !getProjectActivitiesSQLStatement ||
        !getProjectIUCNActionClassificationSQLStatement ||
        !getProjectFundingSourceSQLStatement ||
        !getProjectFocalSpeciesSQLStatement ||
        !getProjectAncillarySpeciesSQLStatement ||
        !getProjectIndigenousPartnershipsSQLStatement ||
        !getProjectStakeholderPartnershipsSQLStatement
      ) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const [
        projectData,
        permitData,
        locationData,
        activityData,
        iucnClassificationData,
        fundingData,
        focalSpecies,
        ancillarySpecies,
        indigenousPartnerships,
        stakeholderPartnerships
      ] = await Promise.all([
        await connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values),
        await connection.query(getProjectPermitsSQLStatement.text, getProjectPermitsSQLStatement.values),
        await connection.query(getProjectLocationSQLStatement.text, getProjectLocationSQLStatement.values),
        await connection.query(getProjectActivitiesSQLStatement.text, getProjectActivitiesSQLStatement.values),
        await connection.query(
          getProjectIUCNActionClassificationSQLStatement.text,
          getProjectIUCNActionClassificationSQLStatement.values
        ),
        await connection.query(getProjectFundingSourceSQLStatement.text, getProjectFundingSourceSQLStatement.values),
        await connection.query(getProjectFocalSpeciesSQLStatement.text, getProjectFocalSpeciesSQLStatement.values),
        await connection.query(
          getProjectAncillarySpeciesSQLStatement.text,
          getProjectAncillarySpeciesSQLStatement.values
        ),
        await connection.query(
          getProjectIndigenousPartnershipsSQLStatement.text,
          getProjectIndigenousPartnershipsSQLStatement.values
        ),
        await connection.query(
          getProjectStakeholderPartnershipsSQLStatement.text,
          getProjectStakeholderPartnershipsSQLStatement.values
        )
      ]);

      await connection.commit();

      const getProjectData =
        (projectData &&
          projectData.rows &&
          activityData &&
          activityData.rows &&
          new GetProjectData(projectData.rows[0], activityData.rows)) ||
        null;

      const getPermitData = (permitData && permitData.rows && new GetPermitData(permitData.rows)) || null;

      const getObjectivesData = (projectData && projectData.rows && new GetObjectivesData(projectData.rows[0])) || null;

      const getLocationData = (locationData && locationData.rows && new GetLocationData(locationData.rows)) || null;

      const getCoordinatorData =
        (projectData && projectData.rows && new GetCoordinatorData(projectData.rows[0])) || null;

      const getSpeciesData =
        (focalSpecies &&
          focalSpecies.rows &&
          ancillarySpecies &&
          ancillarySpecies.rows &&
          new GetSpeciesData(focalSpecies.rows, ancillarySpecies.rows)) ||
        null;

      const getPartnershipsData =
        (indigenousPartnerships &&
          indigenousPartnerships.rows &&
          stakeholderPartnerships &&
          stakeholderPartnerships.rows &&
          new GetPartnershipsData(indigenousPartnerships.rows, stakeholderPartnerships.rows)) ||
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
        permit: getPermitData,
        coordinator: getCoordinatorData,
        objectives: getObjectivesData,
        location: getLocationData,
        iucn: getIUCNClassificationData,
        funding: getFundingData,
        species: getSpeciesData,
        partnerships: getPartnershipsData
      };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
