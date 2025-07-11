import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../../database/db';
import { IPutCollectionLinkRequest } from '../../../../../models/collection-link';
import { CollectionLinkSchema, UpdateCollectionLinkSchema } from '../../../../../openapi/schemas/collection-link';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { CollectionLinkService } from '../../../../../services/collection-link-service';
import { getLogger } from '../../../../../utils/logger';
import { COLLECTION_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';

const defaultLog = getLogger('paths/collection/{collectionId}/links/{linkId}');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          discriminator: 'SystemRole',
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]
        },
        {
          discriminator: 'CollectionRole',
          validCollectionRoles: [COLLECTION_ROLE.ADMIN],
          collectionId: Number(req.params.collectionId)
        }
      ]
    };
  }),
  updateCollectionLink()
];

PUT.apiDoc = {
  description: 'Updates an existing collection link',
  tags: ['collection-links'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'collectionId',
      required: true,
      schema: {
        type: 'integer',
        minimum: 1
      }
    },
    {
      in: 'path',
      name: 'linkId',
      required: true,
      schema: {
        type: 'integer',
        minimum: 1
      }
    }
  ],
  requestBody: {
    description: 'Collection link update request object.',
    required: true,
    content: {
      'application/json': {
        schema: UpdateCollectionLinkSchema
      }
    }
  },
  responses: {
    200: {
      description: 'Collection link updated successfully.',
      content: {
        'application/json': {
          schema: CollectionLinkSchema
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
 * Update an existing collection link
 *
 * @returns {RequestHandler}
 */
export function updateCollectionLink(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'updateCollectionLink' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionId = Number(req.params.collectionId);
      const linkId = Number(req.params.linkId);

      const collectionLinkService = new CollectionLinkService(connection);

      const data = req.body as IPutCollectionLinkRequest;

      const updatedLink = await collectionLinkService.updateCollectionLink(collectionId, linkId, data);

      await connection.commit();

      return res.status(200).json(updatedLink);
    } catch (error) {
      defaultLog.error({ label: 'updateCollectionLink', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          discriminator: 'SystemRole',
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]
        },
        {
          discriminator: 'CollectionRole',
          validCollectionRoles: [COLLECTION_ROLE.ADMIN],
          collectionId: Number(req.params.collectionId)
        }
      ]
    };
  }),
  deleteCollectionLink()
];

DELETE.apiDoc = {
  description: 'Deletes an existing collection link',
  tags: ['collection-links'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'collectionId',
      required: true,
      schema: {
        type: 'integer',
        minimum: 1
      }
    },
    {
      in: 'path',
      name: 'linkId',
      required: true,
      schema: {
        type: 'integer',
        minimum: 1
      }
    }
  ],
  responses: {
    204: {
      description: 'Collection link deleted successfully.'
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
 * Delete an existing collection link
 *
 * @returns {RequestHandler}
 */
export function deleteCollectionLink(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'deleteCollectionLink' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionId = Number(req.params.collectionId);
      const linkId = Number(req.params.linkId);

      const collectionLinkService = new CollectionLinkService(connection);

      await collectionLinkService.deleteCollectionLink(collectionId, linkId);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteCollectionLink', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
