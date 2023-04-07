import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/http-error';
import { draftGetResponseObject } from '../../../openapi/schemas/draft';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { DraftService } from '../../../services/draft-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/draft/{draftId}');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSingleDraft()
];

GET.apiDoc = {
  description: 'Get a draft.',
  tags: ['draft'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'draftId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Draft with matching draftId.',
      content: {
        'application/json': {
          schema: {
            ...(draftGetResponseObject as object)
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
 * Get a draft by its id.
 *
 * @returns {RequestHandler}
 */
export function getSingleDraft(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    const draftId = Number(req.params.draftId);

    try {
      await connection.open();

      const draftService = new DraftService(connection);

      const draftObject = await draftService.getSingleDraft(draftId);

      if (!draftObject) {
        throw new HTTP400('Failed to get draft');
      }

      await connection.commit();

      return res.status(200).json(draftObject);
    } catch (error) {
      defaultLog.error({ label: 'getSingleDraft', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
