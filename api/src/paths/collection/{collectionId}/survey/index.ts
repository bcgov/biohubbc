import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { COLLECTION_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { IAddMultipleSurveysToCollection, ICollectionAdvancedFilters } from '../../../../models/collection';
import { AddSurveysToCollectionSchema } from '../../../../openapi/schemas/collection-survey';
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
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          discriminator: 'CollectionRole',
          collectionId: Number(req.params.collectionId),
          validCollectionRoles: [COLLECTION_ROLE.ADMIN, COLLECTION_ROLE.MEMBER]
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
 * Get surveys in a specific collection
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

      const filterFields = parseQueryParams(req);

      const collectionSurveyService = new CollectionSurveyService(connection);

      const collectionId = Number(req.params.collectionId);

      const surveys = await collectionSurveyService.getSurveysBasicFieldsByCollectionId(
        collectionId,
        filterFields,
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

/**
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, ICollectionAdvancedFilters>} req
 * @return {*}  {ICollectionAdvancedFilters}
 */
function parseQueryParams(
  req: Request<unknown, unknown, unknown, ICollectionAdvancedFilters>
): ICollectionAdvancedFilters {
  return {
    keyword: req.query.keyword ?? undefined,
    system_user_id: (req.query.system_user_id && Number(req.query.system_user_id)) ?? undefined
  };
}

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          discriminator: 'CollectionRole',
          collectionId: Number(req.params.collectionId),
          validCollectionRoles: [COLLECTION_ROLE.ADMIN, COLLECTION_ROLE.MEMBER]
        }
      ]
    };
  }),
  addSurveysToCollection()
];

POST.apiDoc = {
  description: 'Adds multiple surveys to a collection',
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
  requestBody: {
    description: 'Collection update request object.',
    required: true,
    content: {
      'application/json': {
        schema: AddSurveysToCollectionSchema
      }
    }
  },
  responses: {
    200: {
      description: 'Collection response object.'
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
 * Get surveys in a specific collection
 *
 * @returns {RequestHandler}
 */
export function addSurveysToCollection(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'addSurveysToCollection' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserGuid = connection.systemUserGUID();

      const collectionSurveyService = new CollectionSurveyService(connection);

      const data = req.body as IAddMultipleSurveysToCollection;

      await collectionSurveyService.addMultipleSurveysToCollection(systemUserGuid, data);

      await connection.commit();

      return res.status(200).json();
    } catch (error) {
      defaultLog.error({ label: 'addSurveysToCollection', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
