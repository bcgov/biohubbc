'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { getAllAssignablePermitsForASurveySQL } from '../../../../../queries/survey/survey-view-queries';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/permits/list');

export const GET: Operation = [getPermitNumbers()];

GET.apiDoc = {
  description: 'Fetches a list of permit numbers for a survey based on a project.',
  tags: ['permit_numbers'],
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
    }
  ],
  responses: {
    200: {
      description: 'Permit numbers get response string array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Permit numbers applicable for the survey'
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

export function getPermitNumbers(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get permit numbers list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveyPermitNumbersSQLStatement = getAllAssignablePermitsForASurveySQL(Number(req.params.projectId));

      if (!getSurveyPermitNumbersSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const permitNumbersData = await connection.query(
        getSurveyPermitNumbersSQLStatement.text,
        getSurveyPermitNumbersSQLStatement.values
      );

      await connection.commit();

      const getPermitNumbersData = (permitNumbersData && permitNumbersData.rows) || null;

      return res.status(200).json(getPermitNumbersData);
    } catch (error) {
      defaultLog.debug({ label: 'getPermitNumbers', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
