import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { GetCollectionSchema } from '../../../openapi/schemas/collection';
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
  getCollectionParentsById()
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
      description: 'Collection hierarchy response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['hierarchy'],
            properties: {
              hierarchy: GetCollectionSchema
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
 * Get the parent hierarchy of a specific collection
 *
 * @returns {RequestHandler}
 */
export function getCollectionParentsById(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getCollectionParentsById' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionService = new CollectionService(connection);

      const collectionId = Number(req.params.collectionId);

      const collections = await collectionService.getCollectionParentsById(collectionId);

      console.log(collections);

      await connection.commit();

      return res.status(200).json({ hierarchy: collections });
    } catch (error) {
      defaultLog.error({ label: 'getCollectionParentsById', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
