import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { PostBlockObservationObject } from '../../../../../../models/block-observation-create';
import { observationPostResponseObject } from '../../../../../../openapi/schemas/observation';
import { postBlockObservationSQL } from '../../../../../../queries/observation/observation-create-queries';
import { getLogger } from '../../../../../../utils/logger';
import { logRequest } from '../../../../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/observations/create');

export const POST: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/observations/create', 'POST'),
  createObservation()
];

export enum OBSERVATION_TYPES {
  block = 'block'
}

export const getAllObservationTypes = (): string[] => Object.values(OBSERVATION_TYPES);

POST.apiDoc = {
  description: 'Create a new observation.',
  tags: ['observation'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Observation post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Observation request object',
          type: 'object',
          required: ['observation_type'],
          properties: {
            observation_type: {
              title: 'type of observation (eg block)',
              type: 'string',
              enum: getAllObservationTypes()
            },
            observation_details_data: {
              title: 'Generic observation json data',
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
      description: 'Observation response object.',
      content: {
        'application/json': {
          schema: {
            ...(observationPostResponseObject as object)
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
 * Creates a new observation record.
 *
 * @returns {RequestHandler}
 */
export function createObservation(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'createObservation',
      message: 'params and body',
      'req.params': req.params,
      'req.body': req.body
    });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.body.observation_type) {
      throw new HTTP400('Missing required body param `observation_type`');
    }

    if (!req.body.observation_details_data) {
      throw new HTTP400('Missing required body param `observation_details_data`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    let sanitizedObservationData = null;
    let observationSQLStatement = null;

    if (req.body.observation_type === 'block') {
      sanitizedObservationData = new PostBlockObservationObject(req.body.observation_details_data);
      observationSQLStatement = postBlockObservationSQL(Number(req.params.surveyId), sanitizedObservationData);
    }

    if (!observationSQLStatement) {
      throw new HTTP400('Failed to build observation SQL insert statement');
    }

    try {
      await connection.open();

      // Handle observation details
      const observationResponse = await connection.query(observationSQLStatement.text, observationSQLStatement.values);

      await connection.commit();

      const observationResult =
        (observationResponse && observationResponse.rows && observationResponse.rows[0]) || null;

      if (!observationResult || !observationResult.id) {
        throw new HTTP400('Failed to insert observation data');
      }

      return res.status(200).json({ id: observationResult.id });
    } catch (error) {
      defaultLog.debug({ label: 'createObservation', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
