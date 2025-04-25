import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { ICollectionParticipantsAdvancedFilters } from '../../../../models/collection';
import { GetCollectionParticipantsSchema } from '../../../../openapi/schemas/collection';
import { paginationRequestQueryParamSchema } from '../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { CollectionParticipationService } from '../../../../services/collection-participation-service';
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
  getCollectionParticipants()
];

GET.apiDoc = {
  description: 'Get participants of a collection',
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
      description: 'Collection participants response object.',
      content: {
        'application/json': {
          schema: GetCollectionParticipantsSchema
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
 * Get participants of a collection
 *
 * @returns {RequestHandler}
 */
export function getCollectionParticipants(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getCollectionParticipants' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const filterFields = parseQueryParams(req);

      const collectionParticipationService = new CollectionParticipationService(connection);

      const collectionId = Number(req.params.collectionId);

      const participants = await collectionParticipationService.getCollectionParticipants(
        collectionId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );
      const participantsTotalCount = await collectionParticipationService.getCollectionParticipantsCount(collectionId);

      const response = {
        participants,
        pagination: makePaginationResponse(participantsTotalCount, paginationOptions)
      };

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getCollectionParticipants', message: 'error', error });
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
 * @param {Request<unknown, unknown, unknown, ICollectionParticipantsAdvancedFilters>} req
 * @return {*}  {ICollectionAdvancedFilters}
 */
function parseQueryParams(
  req: Request<unknown, unknown, unknown, ICollectionParticipantsAdvancedFilters>
): ICollectionParticipantsAdvancedFilters {
  return {
    keyword: req.query.keyword ?? undefined,
    system_user_id: (req.query.system_user_id && Number(req.query.system_user_id)) ?? undefined
  };
}
