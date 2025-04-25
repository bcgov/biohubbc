import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getDBConnection } from '../../database/db';
import { CollectionService } from '../../services/collection-service';
import { getLogger } from '../../utils/logger';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getSystemUserFromRequest } from '../../utils/request';
import { userHasValidRole } from '../../request-handlers/security/authorization';

const defaultLog = getLogger('paths/collections');

/**
 * GET /api/collection
 * Fetch all collections.
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
  description: 'Fetch all collections.',
  tags: ['collection'],
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: 'List of collections.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                collection_id: { type: 'integer' },
                name: { type: 'string' },
                objectives: { type: 'string' }
              }
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
 * POST /api/collection
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
 * Fetch collections for the current user.
 *
 * @returns {RequestHandler}
 */
export function findCollections(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();
      
      const systemUser = getSystemUserFromRequest(req);
      
      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        systemUser.role_names)

      const collectionService = new CollectionService(connection);

      const collections = await collectionService.getAllCollections();

      await connection.commit();

      return res
        .status(200)
        .json(collections);
    } catch (error) {
      defaultLog.error({ label: 'findCollections', message: 'error', error });
      connection.rollback();
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

      const collectionService = new CollectionService(connection);
      const newCollection = await collectionService.createCollection(req.body);

      await connection.commit();

      res.status(201).json(newCollection);
    } catch (error) {
      defaultLog.error({ label: 'createCollection', message: 'error', error });
      connection.rollback();
      res.status(500).json({ error: 'Failed to create collection' });
    } finally {
      connection.release();
    }
  };
}



