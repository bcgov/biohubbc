'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { deleteSummarySubmissionSQL } from '../../../../../../../../queries/survey/survey-summary-queries';
import { PROJECT_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../errors/CustomError';
import { getLogger } from '../../../../../../../../utils/logger';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/summary/submission/{summaryId}/delete');

export const DELETE: Operation = [
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
  deleteSummarySubmission()
];

DELETE.apiDoc = {
  description: 'Soft deletes a summary submission by ID.',
  tags: ['summary_submission', 'delete'],
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
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'summaryId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Summary submission csv details response.',
      content: {
        'application/json': {
          schema: {
            title: 'Row count of soft deleted records',
            type: 'number'
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function deleteSummarySubmission(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'Soft delete a summary submission by ID',
      message: 'params',
      req_params: req.params
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.summaryId) {
      throw new HTTP400('Missing required path param `summaryId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const deleteSubmissionSQLStatement = deleteSummarySubmissionSQL(Number(req.params.summaryId));

      if (!deleteSubmissionSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      await connection.open();

      const deleteResult = await connection.query(
        deleteSubmissionSQLStatement.text,
        deleteSubmissionSQLStatement.values
      );

      await connection.commit();

      const deleteResponse = (deleteResult && deleteResult.rowCount) || null;

      return res.status(200).json(deleteResponse);
    } catch (error) {
      defaultLog.error({ label: 'deleteSummarySubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
