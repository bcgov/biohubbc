'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import {
  getProjectAttachmentSecurityRuleSQL,
  applyProjectAttachmentSecurityRuleSQL,
  addProjectAttachmentSecurityRuleSQL
} from '../../../../../queries/project/project-attachments-queries';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/makePrivate');

export const PUT: Operation = [makeProjectAttachmentPrivate()];

PUT.apiDoc = {
  description: 'Make visibility of a project attachment private.',
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
  responses: {
    200: {
      description: 'Project attachment make private visibility response.',
      content: {
        'application/json': {
          schema: {
            title: 'Row count of record for which visibility has been made private',
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

export function makeProjectAttachmentPrivate(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'Make visibility of a project attachment private',
      message: 'params',
      req_params: req.params
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      let securityRuleId: number | null = null;

      // Step 1: Check if security rule already exists
      const getSecurityRuleSQLStatement = getProjectAttachmentSecurityRuleSQL(Number(req.params.attachmentId));

      if (!getSecurityRuleSQLStatement) {
        throw new HTTP400('Failed to build SQL get project attachment security rule statement');
      }

      const getSecurityRuleSQLResponse = await connection.query(
        getSecurityRuleSQLStatement.text,
        getSecurityRuleSQLStatement.values
      );

      securityRuleId =
        (getSecurityRuleSQLResponse &&
          getSecurityRuleSQLResponse.rows &&
          getSecurityRuleSQLResponse.rows[0] &&
          getSecurityRuleSQLResponse.rows[0].id) ||
        null;

      // Step 2: Create security rule if it does not exist
      if (!securityRuleId) {
        const createSecurityRuleSQLStatement = addProjectAttachmentSecurityRuleSQL(
          Number(req.params.projectId),
          Number(req.params.attachmentId)
        );

        if (!createSecurityRuleSQLStatement) {
          throw new HTTP400('Failed to build SQL insert project attachment security rule statement');
        }

        const createSecurityRuleSQLResponse = await connection.query(
          createSecurityRuleSQLStatement.text,
          createSecurityRuleSQLStatement.values
        );

        securityRuleId =
          (createSecurityRuleSQLResponse &&
            createSecurityRuleSQLResponse.rows &&
            createSecurityRuleSQLResponse.rows[0] &&
            createSecurityRuleSQLResponse.rows[0].id) ||
          null;

        if (!securityRuleId) {
          throw new HTTP400('Failed to insert project attachment security rule');
        }
      }

      // Step 3: Apply the security rule that was fetched or created
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

      await connection.commit();

      return res.status(200).json(1);
    } catch (error) {
      defaultLog.debug({ label: 'makeProjectAttachmentPrivate', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
