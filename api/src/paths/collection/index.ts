import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { ICollectionAdvancedFilters, IPostCollectionRequest } from '../../models/collection';
import { CreateCollectionSchema, GetCollectionSchema } from '../../openapi/schemas/collection';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { CollectionService } from '../../services/collection-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';
import { getSystemUserFromRequest } from '../../utils/request';

const defaultLog = getLogger('paths/collection/index');

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
  findCollections()
];

GET.apiDoc = {
  description: "Gets a list of collections based on the user's permissions and filter criteria.",
  tags: ['collections'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
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
      name: 'itis_tsn',
      description: 'ITIS TSN number',
      required: false,
      schema: {
        type: 'integer',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'collection_name',
      required: false,
      schema: {
        type: 'string',
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
              collections: {
                type: 'array',
                items: GetCollectionSchema
              },
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
 * Get collections for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function findCollections(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findCollections' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const systemUser = getSystemUserFromRequest(req);

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        systemUser.role_names
      );

      const filterFields = parseQueryParams(req);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const collectionService = new CollectionService(connection);

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
      defaultLog.error({ label: 'findCollections', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Returns null instead of undefined if the value is null
 *
 * @param {number | null | undefined} param
 * @returns
 */
const parseNullableQueryParam = (param: number | null | undefined) => {
  if (param === null) {
    return null;
  }
  return param ? Number(param) : undefined;
};

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
    system_user_id: req.query.system_user_id !== undefined ? Number(req.query.system_user_id) : undefined,
    parent_collection_id: parseNullableQueryParam(req.query.parent_collection_id)
  };
}

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  createCollection()
];

POST.apiDoc = {
  description: 'Creates a new collection',
  tags: ['collections'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Collection create request object.',
    required: true,
    content: {
      'application/json': {
        schema: CreateCollectionSchema
      }
    }
  },
  responses: {
    201: {
      description: 'Collection create response object.'
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
 * Create a new collection
 *
 * @returns {RequestHandler}
 */
export function createCollection(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'createCollection' });

    console.log('HERE');

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      // TODO: FIX THE SYSTEM_USER QUERY
      const systemUserId = connection.systemUserId();

      console.log(systemUserId);

      const collectionService = new CollectionService(connection);

      const data = req.body as IPostCollectionRequest;

      await collectionService.createCollection(data, systemUserId);
      await connection.commit();

      return res.status(201).json();
    } catch (error) {
      defaultLog.error({ label: 'createCollection', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
