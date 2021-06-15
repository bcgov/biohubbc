import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { observationUpdateGetResponseObject } from '../../../../../../../openapi/schemas/observation';
import { getLogger } from '../../../../../../../utils/logger';
import { logRequest } from '../../../../../../../utils/path-utils';
import { RequestHandler } from 'express';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import { getBlockObservationSQL } from '../../../../../../../queries/observation/observation-update-queries';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/observations/{observationId}/update');

export const GET: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/observations/{observationId}/update', 'GET'),
  getObservationForUpdate()
];

GET.apiDoc = {
  description: 'Get an observation, for update purposes.',
  tags: ['observation'],
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
      name: 'observationId',
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'query',
      name: 'entity',
      schema: {
        type: 'string'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Observation with matching observationId.',
      content: {
        'application/json': {
          schema: {
            ...(observationUpdateGetResponseObject as object)
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
 * Get an observation by observationId and entity type.
 *
 * @returns {RequestHandler}
 */
export function getObservationForUpdate(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.observationId) {
      throw new HTTP400('Missing required path param `observationId`');
    }

    const entity: string = req.query?.entity as string;
    const connection = getDBConnection(req['keycloak_token']);

    try {
      let getObservationSQLStatement;

      if (entity === 'block') {
        getObservationSQLStatement = getBlockObservationSQL(Number(req.params.observationId));
      }

      if (!getObservationSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const observationResponse = await connection.query(
        getObservationSQLStatement.text,
        getObservationSQLStatement.values
      );

      await connection.commit();

      const observationResult =
        (observationResponse && observationResponse.rows && observationResponse.rows[0]) || null;

      return res.status(200).json(observationResult);
    } catch (error) {
      defaultLog.debug({ label: 'getObservationForUpdate', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
