import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { queries } from '../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/makeSecure');

export const PUT: Operation = [
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
  makeProjectAttachmentSecure()
];

PUT.apiDoc = {
  description: 'Make security status of a project attachment secure.',
  tags: ['attachment', 'security_status'],
  security: [
    {
      Bearer: []
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
  requestBody: {
    description: 'Current attachment type for project attachment.',
    content: {
      'application/json': {
        schema: {
          type: 'object'
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project attachment make secure security status response.',
      content: {
        'application/json': {
          schema: {
            title: 'Row count of record for which security status has been made secure',
            type: 'number'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function makeProjectAttachmentSecure(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'Make security status of a project attachment secure',
      message: 'params',
      req_params: req.params
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    if (!req.body || !req.body.attachmentType) {
      throw new HTTP400('Missing required body param `attachmentType`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const secureRecordSQLStatement =
        req.body.attachmentType === 'Report'
          ? queries.security.secureAttachmentRecordSQL(
              Number(req.params.attachmentId),
              'project_report_attachment',
              Number(req.params.projectId)
            )
          : queries.security.secureAttachmentRecordSQL(
              Number(req.params.attachmentId),
              'project_attachment',
              Number(req.params.projectId)
            );

      if (!secureRecordSQLStatement) {
        throw new HTTP400('Failed to build SQL secure record statement');
      }

      const secureRecordSQLResponse = await connection.query(
        secureRecordSQLStatement.text,
        secureRecordSQLStatement.values
      );

      if (!secureRecordSQLResponse || !secureRecordSQLResponse.rowCount) {
        throw new HTTP400('Failed to secure record');
      }

      await connection.commit();

      return res.status(200).json(1);
    } catch (error) {
      defaultLog.error({ label: 'makeProjectAttachmentSecure', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
