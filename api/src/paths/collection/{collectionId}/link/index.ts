import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { IPostCollectionLinkRequest } from '../../../../models/collection-link';
import { CollectionLinkSchema, CreateCollectionLinkSchema } from '../../../../openapi/schemas/collection-link';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { CollectionLinkService } from '../../../../services/collection-link-service';
import { getLogger } from '../../../../utils/logger';
import { SYSTEM_ROLE, COLLECTION_ROLE } from '../../../../constants/roles';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../utils/pagination';

const defaultLog = getLogger('paths/collection/{collectionId}/link');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          discriminator: 'SystemRole',
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]
        },
        {
          discriminator: 'CollectionRole',
          validCollectionRoles: [COLLECTION_ROLE.ADMIN, COLLECTION_ROLE.MEMBER],
          collectionId: Number(req.params.collectionId)
        }
      ]
    };
  }),
  getCollectionLinks()
];

GET.apiDoc = {
  description: 'Gets a list of links for a specific collection.',
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
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Collection links response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['links', 'pagination'],
            properties: {
              links: {
                type: 'array',
                items: CollectionLinkSchema
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
 * Get links for a specific collection.
 *
 * @returns {RequestHandler}
 */
export function getCollectionLinks(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getCollectionLinks' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionId = Number(req.params.collectionId);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const collectionLinkService = new CollectionLinkService(connection);

      const [link, linksTotalCount] = await Promise.all([
        collectionLinkService.getCollectionLinks(collectionId, ensureCompletePaginationOptions(paginationOptions)),
        collectionLinkService.getCollectionLinksCount(collectionId)
      ]);

      await connection.commit();

      const response = {
        links: link, 
        pagination: makePaginationResponse(linksTotalCount, paginationOptions)
      };

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getCollectionLinks', message: 'error', error });
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
  createCollectionLink()
];

POST.apiDoc = {
  description: 'Creates a new link for a collection',
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
    }
  ],
  requestBody: {
    description: 'Collection link create request object.',
    required: true,
    content: {
      'application/json': {
        schema: CreateCollectionLinkSchema
      }
    }
  },
  responses: {
    201: {
      description: 'Collection link created successfully.',
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
 * Create a new collection link
 *
 * @returns {RequestHandler}
 */
export function createCollectionLink(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'createCollectionLink' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionId = Number(req.params.collectionId);

      const collectionLinkService = new CollectionLinkService(connection);

      const data = req.body as IPostCollectionLinkRequest;

      const createdLink = await collectionLinkService.createCollectionLink(collectionId, data);

      await connection.commit();

      return res.status(201).json(createdLink);
    } catch (error) {
      defaultLog.error({ label: 'createCollectionLink', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
