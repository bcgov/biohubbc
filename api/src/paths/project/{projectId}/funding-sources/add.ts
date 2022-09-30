import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/http-error';
import { PostFundingSource } from '../../../../models/project-create';
import { queries } from '../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { PlatformService } from '../../../../services/platform-service';
import { getLogger } from '../../../../utils/logger';
import { addFundingSourceApiDocObject } from '../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/projects/{projectId}/funding-sources/add');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  addFundingSource()
];

POST.apiDoc = addFundingSourceApiDocObject('Add a funding source of a project.', 'new project funding source id');

export function addFundingSource(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);

    if (!projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedPostFundingSource = req.body && new PostFundingSource(req.body);

    if (!sanitizedPostFundingSource) {
      throw new HTTP400('Missing funding source data');
    }

    try {
      await connection.open();

      const addFundingSourceSQLStatement = queries.project.postProjectFundingSourceSQL(
        sanitizedPostFundingSource,
        projectId
      );

      if (!addFundingSourceSQLStatement) {
        throw new HTTP400('Failed to build addFundingSourceSQLStatement');
      }

      const response = await connection.query(addFundingSourceSQLStatement.text, addFundingSourceSQLStatement.values);

      const result = (response && response.rows && response.rows[0]) || null;

      if (!result || !result.id) {
        throw new HTTP400('Failed to insert project funding source data');
      }

      try {
        const platformService = new PlatformService(connection);
        await platformService.submitDwCAMetadataPackage(projectId);
      } catch (error) {
        // Don't fail the rest of the endpoint if submitting metadata fails
        defaultLog.error({ label: 'addFundingSource->submitDwCAMetadataPackage', message: 'error', error });
      }

      await connection.commit();

      return res.status(200).json({ id: result.id });
    } catch (error) {
      defaultLog.error({ label: 'addFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
