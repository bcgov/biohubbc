import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { PostBlockObservationObject } from '../../../../../../models/block-observation-create';
import { blockObservationIdResponseObject } from '../../../../../../openapi/schemas/observation';
import { postBlockObservationSQL } from '../../../../../../queries/observation/observation-create-queries';
import { getLogger } from '../../../../../../utils/logger';
import { logRequest } from '../../../../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/observations/create');

export const POST: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/observations/create', 'POST'),
  createBlockObservation()
];

POST.apiDoc = {
  description: 'Create a new observation.',
  tags: ['observation'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Block Observation post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Observation request object',
          type: 'object',
          properties: {
            block_name: {
              title: 'block_name of the observation',
              type: 'string'
            },
            start_datetime: {
              type: 'string',
              description: 'ISO 8601 date string'
            },
            end_datetime: {
              type: 'string',
              description: 'ISO 8601 date string'
            },
            observation_count: {
              type: 'number'
            },
            observation_data: {
              title: 'Block observation json data',
              type: 'object',
              properties: {}
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Block Observation response object.',
      content: {
        'application/json': {
          schema: {
            ...(blockObservationIdResponseObject as object)
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
 * Creates a new block observation record.
 *
 * @returns {RequestHandler}
 */
export function createBlockObservation(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'createBlockObservation',
      message: 'params and body',
      'req.params': req.params,
      'req.body': req.body
    });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);
    const sanitizedPostBlockObservationData = (req.body && new PostBlockObservationObject(req.body)) || null;

    if (!sanitizedPostBlockObservationData) {
      throw new HTTP400('Missing block observation data');
    }

    try {
      const postBlockObservationSQLStatement = postBlockObservationSQL(
        Number(req.params.surveyId),
        sanitizedPostBlockObservationData
      );

      if (!postBlockObservationSQLStatement) {
        throw new HTTP400('Failed to build survey SQL insert statement');
      }
      await connection.open();

      // Handle observation block details
      const createBlockObservationResponse = await connection.query(
        postBlockObservationSQLStatement.text,
        postBlockObservationSQLStatement.values
      );

      await connection.commit();

      const blockObservationResult =
        (createBlockObservationResponse &&
          createBlockObservationResponse.rows &&
          createBlockObservationResponse.rows[0]) ||
        null;

      if (!blockObservationResult || !blockObservationResult.id) {
        throw new HTTP400('Failed to insert block observation data');
      }

      return res.status(200).json({ id: blockObservationResult.id });
    } catch (error) {
      defaultLog.debug({ label: 'createBlockObservation', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
