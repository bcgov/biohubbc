'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { deleteFundingSourceSQL } from '../../../../../queries/project/project-delete-queries';
import { getLogger } from '../../../../../utils/logger';
import { deleteFundingSourceApiDocObject } from '../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/projects/{projectId}/funding-sources/{pfsId}/delete');

export const DELETE: Operation = [deleteFundingSource()];

DELETE.apiDoc = deleteFundingSourceApiDocObject(
  'Delete a funding source of a project.',
  'Row count of successfully deleted funding sources'
);

function deleteFundingSource(): RequestHandler {
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

      const deleteFundingSourceSQLStatement = deleteFundingSourceSQL(
        Number(req.params.projectId),
        Number(req.params.pfsId)
      );

      if (!deleteFundingSourceSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      const response = await connection.query(
        deleteFundingSourceSQLStatement.text,
        deleteFundingSourceSQLStatement.values
      );

      if (!response || !response.rowCount) {
        throw new HTTP400('Failed to delete project funding source');
      }

      await connection.commit();

      return res.status(200).json(response && response.rowCount);
    } catch (error) {
      defaultLog.error({ label: 'deleteFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
