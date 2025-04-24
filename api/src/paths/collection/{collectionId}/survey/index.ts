import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { paginationRequestQueryParamSchema } from '../../../../openapi/schemas/pagination';
import { getSurveysListSchema } from '../../../../openapi/schemas/project';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { CollectionSurveyService } from '../../../../services/collection-survey-service';
import { getLogger } from '../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../utils/pagination';

const defaultLog = getLogger('paths/collection/{collectionId}/survey');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getSurveysInCollection()
];

GET.apiDoc = {
  description: 'Gets the list of surveys in the collection',
  tags: ['collections'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'collectionId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Collection response object.',
      content: {
        'application/json': {
          schema: getSurveysListSchema
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
      $ref: '#/components/responses/403'
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
 * Get a specific collection
 *
 * @returns {RequestHandler}
 */
export function getSurveysInCollection(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getSurveysInCollection' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const collectionSurveyService = new CollectionSurveyService(connection);

      const collectionId = Number(req.params.collectionId);

      const surveys = await collectionSurveyService.getSurveysBasicFieldsByCollectionId(
        collectionId,
        ensureCompletePaginationOptions(paginationOptions)
      );
      const surveysTotalCount = await collectionSurveyService.getSurveyCountByCollectionId(collectionId);

      const response = {
        surveys,
        pagination: makePaginationResponse(surveysTotalCount, paginationOptions)
      };

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSurveysInCollection', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
