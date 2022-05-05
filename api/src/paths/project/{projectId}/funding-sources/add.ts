import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { PostFundingSource } from '../../../../models/project-create';
import { queries } from '../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
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
    defaultLog.debug({
      label: 'Add project funding source',
      message: 'params and body',
      'req.params': req.params,
      'req.body': req.body
    });

    if (!req.params.projectId) {
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
        Number(req.params.projectId)
      );

      if (!addFundingSourceSQLStatement) {
        throw new HTTP400('Failed to build addFundingSourceSQLStatement');
      }

      const response = await connection.query(addFundingSourceSQLStatement.text, addFundingSourceSQLStatement.values);

      const result = (response && response.rows && response.rows[0]) || null;

      if (!result || !result.id) {
        throw new HTTP400('Failed to insert project funding source data');
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
