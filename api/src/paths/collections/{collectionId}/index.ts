import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getDBConnection } from '../../../database/db';
import { CollectionService } from '../../../services/collection-service';
import { getLogger } from '../../../utils/logger';
import { collectionUpdatePutRequestObject } from '../../../openapi/schemas/collection';

const defaultLog = getLogger('paths/collections/{collectionId}');

/**
 * GET /api/collections/{collectionId}
 * Fetch a collection by ID.
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
  findCollectionById()
];

GET.apiDoc = {
  description: 'Fetch a collection by ID.',
  tags: ['collection'],
  security: [{ Bearer: [] }],
  parameters: [
    {
      in: 'path',
      name: 'collectionId',
      required: true,
      schema: {
        type: 'integer'
      },
      description: 'The ID of the collection to fetch'
    }
  ],
  responses: {
    200: {
      description: 'Collection details.',
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
 * Find a collection by ID.
 *
 * @returns {RequestHandler}
 */
export function findCollectionById(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);
    
    try {
      await connection.open();
      
      const collectionService = new CollectionService(connection);
      const collection = await collectionService.getCollectionById(Number(req.params.collectionId));
      
      await connection.commit();

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      
      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      
      return res.status(200).json(collection);
    } catch (error) {
      defaultLog.error({ label: 'findCollectionById', message: 'error', error });
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}


/**
 * PUT /api/collection/{collection_id}
 * Update a collection by ID.
 */
export const PUT: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  updateCollection()
];

PUT.apiDoc = {
  description: 'Update a collection by ID.',
  tags: ['collection'],
  security: [{ Bearer: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: collectionUpdatePutRequestObject as any
      }
    }
  },
  responses: {
    200: {
      description: 'Collection updated successfully.',
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
 * Update a collection by ID.
 *
 * @returns {RequestHandler}
 */
export function updateCollection(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'updateAlert' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionId = Number(req.params.collectionId);
      const collection = req.body;
      const systemUserId = connection.systemUserId();

      const collectionService = new CollectionService(connection);

      const id = await collectionService.updateCollection({ ...collection, collection_id: collectionId }, systemUserId);

      await connection.commit();

      return res.status(200).json({ collection_id: id });
    } catch (error) {
      defaultLog.error({ label: 'updateCollection', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * DELETE /api/collection/{collection_id}
 * Delete a collection by ID.
 */
export const DELETE: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  deleteCollection()
];

DELETE.apiDoc = {
  description: 'Delete a collection by ID.',
  tags: ['collection'],
  security: [{ Bearer: [] }],
  responses: {
    204: {
      description: 'Collection deleted successfully.'
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
 * Delete a collection by ID.
 *
 * @returns {RequestHandler}
 */
export function deleteCollection(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionService = new CollectionService(connection);
      const deleted = await collectionService.deleteCollection(Number(req.params.collection_id));

      await connection.commit();

      if (!deleted) {
        res.status(404).json({ error: 'Collection not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteCollection', message: 'error', error });
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}