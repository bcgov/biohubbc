'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { applyAttachmentSecurityRuleSQL } from '../../../../../../../queries/project/project-attachments-queries';
import { SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import { getLogger } from '../../../../../../../utils/logger';
import {
  addSurveyAttachmentSecurityRuleSQL,
  addSurveyReportAttachmentSecurityRuleSQL,
  getSurveyAttachmentSecurityRuleSQL,
  getSurveyReportAttachmentSecurityRuleSQL
} from '../../../../../../../queries/survey/survey-attachments-queries';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/{attachmentId}/makeSecure');

export const PUT: Operation = [makeSurveyAttachmentSecure()];

PUT.apiDoc = {
  description: 'Make security status of a survey attachment secure.',
  tags: ['attachment', 'security_status'],
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
      name: 'surveyId',
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
    description: 'Current attachment type for survey attachment.',
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
      description: 'Survey attachment make secure security status response.',
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

export function makeSurveyAttachmentSecure(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'Make security status of a survey attachment secure',
      message: 'params',
      req_params: req.params
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
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

      // Step 1: Check if security rule already exists
      let securityRuleId = await getExistingSecurityRule(
        Number(req.params.attachmentId),
        req.body.attachmentType,
        connection
      );

      // Step 2: Create security rule if it does not exist
      if (!securityRuleId) {
        securityRuleId = await createNewSecurityRule(
          Number(req.params.attachmentId),
          req.body.attachmentType,
          connection
        );
      }

      // Step 3: Apply the security rule that was fetched or created
      await applyProjectAttachmentSecurityRule(securityRuleId, connection);

      await connection.commit();

      return res.status(200).json(1);
    } catch (error) {
      defaultLog.debug({ label: 'makeSurveyAttachmentSecure', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getExistingSecurityRule = async (
  attachmentId: number,
  attachmentType: string,
  connection: IDBConnection
): Promise<number | null> => {
  const getSecurityRuleSQLStatement =
    attachmentType === 'Report'
      ? getSurveyReportAttachmentSecurityRuleSQL(attachmentId)
      : getSurveyAttachmentSecurityRuleSQL(attachmentId);

  if (!getSecurityRuleSQLStatement) {
    throw new HTTP400('Failed to build SQL get survey attachment security rule statement');
  }

  const getSecurityRuleSQLResponse = await connection.query(
    getSecurityRuleSQLStatement.text,
    getSecurityRuleSQLStatement.values
  );

  return (
    (getSecurityRuleSQLResponse &&
      getSecurityRuleSQLResponse.rows &&
      getSecurityRuleSQLResponse.rows[0] &&
      getSecurityRuleSQLResponse.rows[0].id) ||
    null
  );
};

export const createNewSecurityRule = async (
  attachmentId: number,
  attachmentType: string,
  connection: IDBConnection
): Promise<number> => {
  const createSecurityRuleSQLStatement =
    attachmentType === 'Report'
      ? addSurveyReportAttachmentSecurityRuleSQL(attachmentId)
      : addSurveyAttachmentSecurityRuleSQL(attachmentId);

  if (!createSecurityRuleSQLStatement) {
    throw new HTTP400('Failed to build SQL insert survey attachment security rule statement');
  }

  const createSecurityRuleSQLResponse = await connection.query(
    createSecurityRuleSQLStatement.text,
    createSecurityRuleSQLStatement.values
  );

  const securityRuleId =
    (createSecurityRuleSQLResponse &&
      createSecurityRuleSQLResponse.rows &&
      createSecurityRuleSQLResponse.rows[0] &&
      createSecurityRuleSQLResponse.rows[0].id) ||
    null;

  if (!securityRuleId) {
    throw new HTTP400('Failed to insert survey attachment security rule');
  }

  return securityRuleId;
};

export const applyProjectAttachmentSecurityRule = async (
  securityRuleId: number,
  connection: IDBConnection
): Promise<void> => {
  const applySecurityRuleSQLStatement = applyAttachmentSecurityRuleSQL(securityRuleId);

  if (!applySecurityRuleSQLStatement) {
    throw new HTTP400('Failed to build SQL apply survey attachment security rule statement');
  }

  const applySecurityRuleSQLResponse = await connection.query(
    applySecurityRuleSQLStatement.text,
    applySecurityRuleSQLStatement.values
  );

  if (!applySecurityRuleSQLResponse) {
    throw new HTTP400('Failed to apply survey attachment security rule');
  }
};
