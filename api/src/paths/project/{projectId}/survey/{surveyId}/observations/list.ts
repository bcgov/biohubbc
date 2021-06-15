import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { GetBlockObservationListData } from '../../../../../../models/observation-view';
import { observationIdResponseObject } from '../../../../../../openapi/schemas/observation';
import { getBlockObservationListSQL } from '../../../../../../queries/observation/observation-view-queries';
import { getLogger } from '../../../../../../utils/logger';
import { logRequest } from '../../../../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/observations/list');

export const GET: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/observations/list', 'GET'),
  getObservationsList()
];

GET.apiDoc = {
  description: 'Get all Observations.',
  tags: ['survey'],
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
    }
  ],
  responses: {
    200: {
      description: 'Observation response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              ...(observationIdResponseObject as object)
            }
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

/**
 * Get all observations.
 *
 * @returns {RequestHandler}
 */
export function getObservationsList(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getBlockObservationListSQLStatement = getBlockObservationListSQL(Number(req.params.surveyId));

      if (!getBlockObservationListSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const getBlockObservationListResponse = await connection.query(
        getBlockObservationListSQLStatement.text,
        getBlockObservationListSQLStatement.values
      );

      await connection.commit();

      let blockObservationsResult: any[] | null = null;

      if (
        getBlockObservationListResponse &&
        getBlockObservationListResponse.rows &&
        new GetBlockObservationListData(getBlockObservationListResponse.rows)
      ) {
        blockObservationsResult = new GetBlockObservationListData(getBlockObservationListResponse.rows)
          .blockObservations;
      }

      return res.status(200).json({
        blocks: blockObservationsResult
      });
    } catch (error) {
      defaultLog.debug({ label: 'getObservationsList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
