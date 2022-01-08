import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { queries } from '../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
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
    defaultLog.debug({ label: 'Delete project funding source', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.pfsId) {
      throw new HTTP400('Missing required path param `pfsId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const deleteProjectFundingSourceSQLStatement = queries.project.deleteProjectFundingSourceSQL(
        Number(req.params.projectId),
        Number(req.params.pfsId)
      );

      if (!deleteProjectFundingSourceSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      const projectFundingSourceDeleteResponse = await connection.query(
        deleteProjectFundingSourceSQLStatement.text,
        deleteProjectFundingSourceSQLStatement.values
      );

      if (!projectFundingSourceDeleteResponse || !projectFundingSourceDeleteResponse.rowCount) {
        throw new HTTP400('Failed to delete project funding source');
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
