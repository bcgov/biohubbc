import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/CustomError';
import { GetObservationsData } from '../../../../models/observations-view';
import { observationsViewGetResponseObject } from '../../../../openapi/schemas/observation';
import { getObservationsForViewSQL } from '../../../../queries/observation/observation-view-queries';
import { getLogger } from '../../../../utils/logger';
import { logRequest } from '../../../../utils/path-utils';

const defaultLog = getLogger('paths/search/{surveyId}/observations/view');

export const GET: Operation = [
  logRequest('paths/search/{surveyId}/observations/view', 'GET'),
  getObservationsForView()
];

GET.apiDoc = {
  description: 'Get survey observations (occurrences), for view-only purposes.',
  tags: ['observations'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  parameters: [
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
      description: 'Observations with matching surveyId.',
      content: {
        'application/json': {
          schema: {
            ...(observationsViewGetResponseObject as object)
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
 * Get observations by projectId and surveyId.
 *
 * @returns {RequestHandler}
 */
export function getObservationsForView(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getObservationsSQLStatement = getObservationsForViewSQL(Number(req.params.surveyId));

      if (!getObservationsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const observationsData = await connection.query(
        getObservationsSQLStatement.text,
        getObservationsSQLStatement.values
      );

      await connection.commit();

      const getObservationsData =
        (observationsData && observationsData.rows && new GetObservationsData(observationsData.rows)) || null;

      return res.status(200).json(getObservationsData);
    } catch (error) {
      defaultLog.debug({ label: 'getObservationsForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
