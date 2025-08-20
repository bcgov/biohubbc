import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../../database/db';
import { IEndCollectionLinkRequest, IPutCollectionLinkRequest } from '../../../../../models/collection-link';
import { CollectionLinkSchema, EndCollectionLinkSchema, UpdateCollectionLinkSchema } from '../../../../../openapi/schemas/collection-link';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { CollectionLinkService } from '../../../../../services/collection-link-service';
import { getLogger } from '../../../../../utils/logger';
import { COLLECTION_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';

const defaultLog = getLogger('paths/collection/{collectionId}/link/{linkId}');

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
  description: 'Updates an existing collection link or ends it by setting record_end_date',
  tags: ['collection-link'],
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
    description: 'Collection link update or end request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          oneOf: [
            UpdateCollectionLinkSchema,
            EndCollectionLinkSchema
          ]
        }
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
 * Update an existing collection link or end it by setting record_end_date
 *
 * @returns {RequestHandler}
 */
export function updateCollectionLink(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionId = Number(req.params.collectionId);
      const linkId = Number(req.params.linkId);
      const collectionLinkService = new CollectionLinkService(connection);

      // Check if this is an end operation (has record_end_date field)
      if ('record_end_date' in req.body) {
        defaultLog.debug({ label: 'endCollectionLink' });
        const data = req.body as IEndCollectionLinkRequest;
        const endedLink = await collectionLinkService.endCollectionLink(collectionId, linkId, data.record_end_date);
        await connection.commit();
        return res.status(200).json(endedLink);
      } else {
        defaultLog.debug({ label: 'updateCollectionLink' });
        const data = req.body as IPutCollectionLinkRequest;
        const updatedLink = await collectionLinkService.updateCollectionLink(collectionId, linkId, data);
        await connection.commit();
        return res.status(200).json(updatedLink);
      }
    } catch (error) {
      defaultLog.error({ label: 'updateCollectionLink', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
