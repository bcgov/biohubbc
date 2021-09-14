'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import {
  updateProjectAttachmentVisibilitySQL,
  getProjectAttachmentSecurityRuleSQL,
  applyProjectAttachmentSecurityRuleSQL
} from '../../../../../queries/project/project-attachments-queries';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/toggleVisibility');

export const PUT: Operation = [toggleProjectAttachmentVisibility()];

PUT.apiDoc = {
  description: 'Toggle the visibility state of a project attachment.',
  tags: ['attachment', 'visibility'],
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
  requestBody: {
    description: 'Current security token value for project attachment.',
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
      description: 'Project attachment toggle visibility response.',
      content: {
        'application/json': {
          schema: {
            title: 'Row count of record for which visibility has been toggled',
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

export function toggleProjectAttachmentVisibility(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Toggle visibility of project attachment', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    if (!req.body) {
      throw new HTTP400('Missing required request body');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      if (!req.body.securityToken) {
        const getSecurityRuleSQLStatement = getProjectAttachmentSecurityRuleSQL(Number(req.params.projectId));

        if (!getSecurityRuleSQLStatement) {
          throw new HTTP400('Failed to build SQL get project attachment security rule statement');
        }

        const getSecurityRuleSQLResponse = await connection.query(
          getSecurityRuleSQLStatement.text,
          getSecurityRuleSQLStatement.values
        );

        const securityRuleId =
          (getSecurityRuleSQLResponse &&
            getSecurityRuleSQLResponse.rows &&
            getSecurityRuleSQLResponse.rows[0] &&
            getSecurityRuleSQLResponse.rows[0].id) ||
          null;

        // Apply the security rule that was fetched or created
        const applySecurityRuleSQLStatement = applyProjectAttachmentSecurityRuleSQL(securityRuleId);

        if (!applySecurityRuleSQLStatement) {
          throw new HTTP400('Failed to build SQL apply project attachment security rule statement');
        }

        const applySecurityRuleSQLResponse = await connection.query(
          applySecurityRuleSQLStatement.text,
          applySecurityRuleSQLStatement.values
        );

        if (!applySecurityRuleSQLResponse) {
          throw new HTTP400('Failed to apply project attachment security rule');
        }
      } else {
        const updateProjectAttachmentVisibilitySQLStatement = updateProjectAttachmentVisibilitySQL(
          Number(req.params.attachmentId)
        );

        if (!updateProjectAttachmentVisibilitySQLStatement) {
          throw new HTTP400('Failed to build SQL update project attachment visibility statement');
        }

        const updateProjectAttachmentVisibilitySQLResponse = await connection.query(
          updateProjectAttachmentVisibilitySQLStatement.text,
          updateProjectAttachmentVisibilitySQLStatement.values
        );

        if (!updateProjectAttachmentVisibilitySQLResponse || !updateProjectAttachmentVisibilitySQLResponse.rowCount) {
          throw new HTTP400('Failed to update project attachment visibility');
        }

        await connection.commit();
      }

      return res.status(200).json(1);
    } catch (error) {
      defaultLog.debug({ label: 'toggleProjectAttachmentVisibility', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
