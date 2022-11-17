import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/http-error';
import { queries } from '../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { PlatformService } from '../../../../../services/platform-service';
import { getLogger } from '../../../../../utils/logger';
import { deleteFundingSourceApiDocObject } from '../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/projects/{projectId}/funding-sources/{pfsId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.query.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteFundingSource()
];

DELETE.apiDoc = deleteFundingSourceApiDocObject(
  'Delete a funding source of a project.',
  'Row count of successfully deleted funding sources'
);

export function deleteFundingSource(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);
    const pfsId = Number(req.params.pfsId);

    if (!projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!pfsId) {
      throw new HTTP400('Missing required path param `pfsId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyFundingSourceDeleteStatement = queries.survey.deleteSurveyFundingSourceByProjectFundingSourceIdSQL(
        pfsId
      );

      const deleteProjectFundingSourceSQLStatement = queries.project.deleteProjectFundingSourceSQL(projectId, pfsId);

      if (!deleteProjectFundingSourceSQLStatement || !surveyFundingSourceDeleteStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      await connection.query(surveyFundingSourceDeleteStatement.text, surveyFundingSourceDeleteStatement.values);

      const projectFundingSourceDeleteResponse = await connection.query(
        deleteProjectFundingSourceSQLStatement.text,
        deleteProjectFundingSourceSQLStatement.values
      );

      if (!projectFundingSourceDeleteResponse.rowCount) {
        throw new HTTP400('Failed to delete project funding source');
      }

      try {
        const platformService = new PlatformService(connection);
        await platformService.submitDwCAMetadataPackage(projectId);
      } catch (error) {
        // Don't fail the rest of the endpoint if submitting metadata fails
        defaultLog.error({ label: 'deleteFundingSource->submitDwCAMetadataPackage', message: 'error', error });
      }

      await connection.commit();

      return res.status(200).json(projectFundingSourceDeleteResponse && projectFundingSourceDeleteResponse.rowCount);
    } catch (error) {
      defaultLog.error({ label: 'deleteFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
