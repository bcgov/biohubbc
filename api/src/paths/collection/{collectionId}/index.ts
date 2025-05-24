import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { COLLECTION_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { IPostCollectionRequest } from '../../../models/collection';
import {
  CreateSubcollectionSchema,
  GetCollectionSchema,
  UpdateCollectionSchema
} from '../../../openapi/schemas/collection';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { CollectionService } from '../../../services/collection-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/collection/{collectionId}/index');

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
  getCollectionById()
];

GET.apiDoc = {
  description: 'Gets a specific collection',
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
    }
  ],
  responses: {
    200: {
      description: 'Collection response object.',
      content: {
        'application/json': {
          schema: GetCollectionSchema
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
export function getCollectionById(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getCollectionById' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionService = new CollectionService(connection);

      const collectionId = Number(req.params.collectionId);

      const response = await collectionService.getCollectionById(collectionId);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getCollectionById', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          discriminator: 'CollectionRole',
          collectionId: Number(req.params.collectionId),
          validCollectionRoles: [COLLECTION_ROLE.ADMIN]
        }
      ]
    };
  }),
  UpdateCollection()
];

PUT.apiDoc = {
  description: 'Updates a specific collection',
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
    }
  ],
  requestBody: {
    description: 'Collection update request object.',
    required: true,
    content: {
      'application/json': {
        schema: UpdateCollectionSchema
      }
    }
  },
  responses: {
    204: {
      description: 'Collection update response object.'
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
 * Updates a specific collection
 *
 * @returns {RequestHandler}
 */
export function UpdateCollection(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'UpdateCollection' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionService = new CollectionService(connection);

      const collectionId = Number(req.params.collectionId);

      const collection = req.body as IPostCollectionRequest;

      await collectionService.updateCollection(collectionId, collection);

      await connection.commit();

      return res.status(204).json();
    } catch (error) {
      defaultLog.error({ label: 'UpdateCollection', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
  createSubcollection()
];

POST.apiDoc = {
  description: 'Creates a new collection',
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
        description: 'Primary key of the collection to use as the parent'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Collection create request object.',
    required: true,
    content: {
      'application/json': {
        schema: CreateSubcollectionSchema
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
 * Create a new subcollection
 *
 * @returns {RequestHandler}
 */
export function createSubcollection(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'createCollection' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const parentCollectionId = Number(req.params.collectionId);

      const collectionService = new CollectionService(connection);

      const data = { ...req.body, parent_collection_id: parentCollectionId } as IPostCollectionRequest;

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

/**
 * DELETE /api/collection/{collection_id}
 * Delete a collection by ID.
 */
export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        } ,
              {
                discriminator: 'CollectionRole',
                collectionId: Number(req.params.collectionId),
                validCollectionRoles: [COLLECTION_ROLE.ADMIN, COLLECTION_ROLE.MEMBER]
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

      const collectionId = Number(req.params.collectionId);

      const systemUserId = connection.systemUserId();
      const collectionService = new CollectionService(connection);
      await collectionService.deleteCollection(collectionId, systemUserId);

      await connection.commit();


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
