import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import {
  getActivitiesByPublicProjectSQL,
  getStakeholderPartnershipsByPublicProjectSQL,
  getFundingSourceByPublicProjectSQL,
  getLocationByPublicProjectSQL,
  getPublicProjectPermitsSQL,
  getPublicProjectSQL,
  getIndigenousPartnershipsByPublicProjectSQL,
  getIUCNActionClassificationByPublicProjectSQL
} from '../../../../queries/public/project-queries';
import { getAPIUserDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/CustomError';
import {
  GetIUCNClassificationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetLocationData,
  GetPermitData
} from '../../../../models/project-view';
import { GetPublicProjectData, GetPublicCoordinatorData } from '../../../../models/public/project';
import { GetFundingData } from '../../../../models/project-view-update';
import { projectViewGetResponseObject } from '../../../../openapi/schemas/project';
import { getLogger } from '../../../../utils/logger';
import { logRequest } from '../../../../utils/path-utils';

const defaultLog = getLogger('paths/public/project/{projectId}/view');

export const GET: Operation = [logRequest('paths/public/project/{projectId}/view', 'GET'), getPublicProjectForView()];

GET.apiDoc = {
  description: 'Get a public (published) project, for view-only purposes.',
  tags: ['project'],
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
 * Get a public (published) project by its id.
 *
 * @returns {RequestHandler}
 */
function getPublicProjectForView(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const getProjectSQLStatement = getPublicProjectSQL(Number(req.params.projectId));
      const getProjectPermitsSQLStatement = getPublicProjectPermitsSQL(Number(req.params.projectId));
      const getProjectLocationSQLStatement = getLocationByPublicProjectSQL(Number(req.params.projectId));
      const getProjectActivitiesSQLStatement = getActivitiesByPublicProjectSQL(Number(req.params.projectId));
      const getProjectIUCNActionClassificationSQLStatement = getIUCNActionClassificationByPublicProjectSQL(
        Number(req.params.projectId)
      );
      const getProjectFundingSourceSQLStatement = getFundingSourceByPublicProjectSQL(Number(req.params.projectId));
      const getProjectIndigenousPartnershipsSQLStatement = getIndigenousPartnershipsByPublicProjectSQL(
        Number(req.params.projectId)
      );
      const getProjectStakeholderPartnershipsSQLStatement = getStakeholderPartnershipsByPublicProjectSQL(
        Number(req.params.projectId)
      );

      if (
        !getProjectSQLStatement ||
        !getProjectPermitsSQLStatement ||
        !getProjectLocationSQLStatement ||
        !getProjectActivitiesSQLStatement ||
        !getProjectIUCNActionClassificationSQLStatement ||
        !getProjectFundingSourceSQLStatement ||
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
          new GetPublicProjectData(projectData.rows[0], activityData.rows)) ||
        null;

      const getPermitData = (permitData && permitData.rows && new GetPermitData(permitData.rows)) || null;

      const getObjectivesData = (projectData && projectData.rows && new GetObjectivesData(projectData.rows[0])) || null;

      const getLocationData = (locationData && locationData.rows && new GetLocationData(locationData.rows)) || null;

      const getCoordinatorData =
        (projectData && projectData.rows && new GetPublicCoordinatorData(projectData.rows[0])) || null;

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
        partnerships: getPartnershipsData
      };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getPublicProjectForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
