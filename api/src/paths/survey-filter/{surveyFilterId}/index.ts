import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { SurveyFilterService } from '../../../services/survey-filter-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/survey-filter/{surveyFilterId}');

export const DELETE: Operation = [
  authorizeRequestHandler(() => {
    return {
      or: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  deleteSurveyFilter()
];

DELETE.apiDoc = {
  description: 'Delete a survey filter',
  tags: ['filters'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyFilterId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Deleted survey filter OK'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    409: {
      $ref: '#/components/responses/409'
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
 * Delete a specific survey filter
 *
 * @returns {RequestHandler}
 */
export function deleteSurveyFilter(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();
      const surveyFilterId = Number(req.params.surveyFilterId);

      const surveyFilterService = new SurveyFilterService(connection);

      await surveyFilterService.deleteSurveyFilter(surveyFilterId, systemUserId);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveyFilter', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
