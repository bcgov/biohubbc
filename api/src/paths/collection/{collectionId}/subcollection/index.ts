import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { COLLECTION_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { ICollectionAdvancedFilters } from '../../../../models/collection';
import { GetCollectionSchema } from '../../../../openapi/schemas/collection';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../../../request-handlers/security/authorization';
import { CollectionService } from '../../../../services/collection-service';
import { getLogger } from '../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../utils/pagination';
import { getSystemUserFromRequest } from '../../../../utils/request';

const defaultLog = getLogger('paths/collection/{collectionId}/subcollection');

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
  findSubcollectionsForCollectionId()
];

GET.apiDoc = {
  description: 'Gets subcollections for a specific collection',
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
        type: 'integer'
      },
      required: true
    },
    {
      in: 'query',
      name: 'keyword',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'itis_tsns',
      description: 'ITIS TSN numbers',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer'
        },
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'system_user_id',
      required: false,
      schema: {
        type: 'number',
        minimum: 1,
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'parent_collection_id',
      required: false,
      schema: {
        type: 'number',
        nullable: true
      }
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Collection response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['collections', 'pagination'],
            properties: {
              collections: { type: 'array', items: GetCollectionSchema },
              pagination: { ...paginationResponseSchema }
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
 * Get subcollections for the given collection id
 *
 * @returns {RequestHandler}
 */
export function findSubcollectionsForCollectionId(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findSubcollectionsForCollectionId' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const systemUser = getSystemUserFromRequest(req);

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        systemUser.role_names
      );

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const collectionService = new CollectionService(connection);

      const collectionId = Number(req.params.collectionId);

      // Inject the collection id from params as the parent collection id
      let filterFields = parseQueryParams(req);
      filterFields = { ...filterFields, parent_collection_id: collectionId };

      const [collections, collectionsTotalCount] = await Promise.all([
        collectionService.findCollections(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        collectionService.findCollectionsCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        collections,
        pagination: makePaginationResponse(collectionsTotalCount, paginationOptions)
      };

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'findSubcollectionsForCollectionId', message: 'error', error });
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
    itis_tsns: req.query.itis_tsns ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined,
    parent_collection_id: req.query.parent_collection_id ?? undefined,
    include_children: req.query.include_children ?? undefined
  };
}
