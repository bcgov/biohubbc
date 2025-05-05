import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { COLLECTION_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { ICollectionMembersAdvancedFilters, IPostCollectionMember } from '../../../../models/collection';
import { CollectionAndSystemUserSchema, CreateCollectionMemberSchema } from '../../../../openapi/schemas/collection';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { CollectionMemberService } from '../../../../services/collection-participation-service';
import { getLogger } from '../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../utils/pagination';

const defaultLog = getLogger('paths/collection/{collectionId}/member');

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
  getCollectionMembers()
];

GET.apiDoc = {
  description: 'Get members of a collection',
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
        minimum: 1
      },
      required: true
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Collection members response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['members', 'pagination'],
            properties: {
              members: {
                type: 'array',
                items: CollectionAndSystemUserSchema
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
 * Get members of a collection
 *
 * @returns {RequestHandler}
 */
export function getCollectionMembers(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getCollectionMembers' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const filterFields = parseQueryParams(req);

      const collectionMemberService = new CollectionMemberService(connection);

      const collectionId = Number(req.params.collectionId);

      const members = await collectionMemberService.getCollectionMembers(
        collectionId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );
      const membersTotalCount = await collectionMemberService.getCollectionMembersCount(collectionId);

      const response = {
        members,
        pagination: makePaginationResponse(membersTotalCount, paginationOptions)
      };

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getCollectionMembers', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, ICollectionMembersAdvancedFilters>} req
 * @return {*}  {ICollectionAdvancedFilters}
 */
function parseQueryParams(
  req: Request<unknown, unknown, unknown, ICollectionMembersAdvancedFilters>
): ICollectionMembersAdvancedFilters {
  return {
    keyword: req.query.keyword ?? undefined,
    system_user_id: (req.query.system_user_id && Number(req.query.system_user_id)) ?? undefined
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
  addMembersToCollection()
];

POST.apiDoc = {
  description: 'Adds multiple members to a collection',
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
        minimum: 1
      },
      required: true
    },
    ...paginationRequestQueryParamSchema
  ],
  requestBody: {
    description: 'Collection member create request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['members'],
          properties: { members: { type: 'array', minItems: 1, items: CreateCollectionMemberSchema } }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Collection response object.'
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
 * Adds members to a collection
 *
 * @returns {RequestHandler}
 */
export function addMembersToCollection(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'addMembersToCollection' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionId = Number(req.params.collectionId);

      const collectionMemberService = new CollectionMemberService(connection);

      const data = req.body.members as IPostCollectionMember[];

      await collectionMemberService.insertCollectionMembers(collectionId, data);

      await connection.commit();

      return res.status(200).json();
    } catch (error) {
      defaultLog.error({ label: 'addMembersToCollection', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
