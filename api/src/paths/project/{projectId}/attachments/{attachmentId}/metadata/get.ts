import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import {
  getProjectReportAttachmentSQL,
  getProjectReportAuthorsSQL
} from '../../../../../../queries/project/project-attachments-queries';
import { getLogger } from '../../../../../../utils/logger';
import { GetReportAttachmentMetadata } from '../../../../../../models/project-survey-attachments';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/getSignedUrl');

export const GET: Operation = [getProjectReportMetaData()];

GET.apiDoc = {
  description: 'Retrieves the report metadata of a project attachment if filetype is Report.',
  tags: ['attachment'],
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
    },
    {
      in: 'path',
      name: 'attachmentId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Response of the report metadata'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getProjectReportMetaData(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getProjectReportMetaData',
      message: 'params',
      req_params: req.params,
      req_query: req.query
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectReportAttachmentSQLStatement = getProjectReportAttachmentSQL(
        Number(req.params.projectId),
        Number(req.params.attachmentId)
      );

      const getProjectReportAuthorsSQLStatement = getProjectReportAuthorsSQL(Number(req.params.attachmentId));

      if (!getProjectReportAttachmentSQLStatement || !getProjectReportAuthorsSQLStatement) {
        throw new HTTP400('Failed to build metadata SQLStatement');
      }

      const connection = getDBConnection(req['keycloak_token']);

      await connection.open();

      const reportMetaData = await connection.query(
        getProjectReportAttachmentSQLStatement.text,
        getProjectReportAttachmentSQLStatement.values
      );
      console.log('reportMetaData: ', reportMetaData);
      const reportAuthorsData = await connection.query(
        getProjectReportAuthorsSQLStatement.text,
        getProjectReportAuthorsSQLStatement.values
      );

      await connection.commit();

      const getReportMetaData = reportMetaData && reportMetaData.rows[0];

      const getReportAuthorsData = reportAuthorsData && reportAuthorsData.rows;

      const reportMetaObj = new GetReportAttachmentMetadata(getReportMetaData, getReportAuthorsData);

      return res.status(200).json(reportMetaObj);
    } catch (error) {
      defaultLog.error({ label: 'getReportMetadata', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
