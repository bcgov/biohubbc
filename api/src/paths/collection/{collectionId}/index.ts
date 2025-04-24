import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { IPostCollectionRequest } from '../../../models/collection';
import { GetCollectionSchema, UpdateCollectionSchema } from '../../../openapi/schemas/collection';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { CollectionService } from '../../../services/collection-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/collection/{collectionId}/index');

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
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
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
