import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { getDBConnection } from '../../database/db';
import { CollectionService } from '../../services/collection-service';
import { getLogger } from '../../utils/logger';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getSystemUserFromRequest } from '../../utils/request';
import { ICollectionAdvancedFilters } from '../../models/collection-view';
import {
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';

const defaultLog = getLogger('paths/collections');

/**
 * GET /api/collections
 * Fetch collections with filtering capabilities.
 */
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
  tags: ['collection'],
  security: [{ Bearer: [] }],
  parameters: [
    {
      in: 'query',
      name: 'keyword',
      schema: {
        type: 'string'
      },
      description: 'Keyword to search for in collection name, objectives or collection ID.'
    },
    {
      in: 'query',
      name: 'system_user_id',
      schema: {
        type: 'integer',
        minimum: 1
      },
      description: 'Filter collections by the ID of a system user who is a member.'
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'List of collections that match the search criteria.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['collections', 'pagination'],
            properties: {
              collections: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['collection_id', 'name', 'objectives', 'members'],
                  properties: {
                    collection_id: { type: 'integer' },
                    name: { type: 'string' },
                    objectives: { type: 'string', nullable: true },
                    members: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          system_user_id: { type: 'number' },
                          display_name: { type: 'string' }
                        }
                      }
                    }
                  }
                }
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
 * POST /api/collections
 * Create a new collection.
 */
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
  description: 'Create a new collection.',
  tags: ['collection'],
  security: [{ Bearer: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['name', 'objectives'],
          properties: {
            name: { type: 'string' },
            objectives: { type: 'string' }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Collection created successfully.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              collection_id: { type: 'integer' },
              name: { type: 'string' },
              objectives: { type: 'string' }
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
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, ICollectionAdvancedFilters>} req
 * @return {*}  {ICollectionAdvancedFilters}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, ICollectionAdvancedFilters>): ICollectionAdvancedFilters {
  const filterFields: ICollectionAdvancedFilters = {};

  if (req.query.keyword) {
    filterFields.keyword = req.query.keyword;
  }

  if (req.query.system_user_id) {
    const systemUserId = Number(req.query.system_user_id);

    if (!isNaN(systemUserId)) {
      filterFields.system_user_id = systemUserId;
    }
  }

  return filterFields;
}

/**
 * Gets collections for the current user
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
        ),
        collectionService.findCollectionsCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        collections,
        pagination: makePaginationResponse(collectionsTotalCount, paginationOptions)
      };

      res.setHeader('Cache-Control', 'private, max-age=30');

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
 * Create a new collection.
 *
 * @returns {RequestHandler}
 */
export function createCollection(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();
      const collectionService = new CollectionService(connection);
      const newCollection = await collectionService.createCollection(req.body, systemUserId);

      await connection.commit();

      res.status(201).json(newCollection);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };
}



