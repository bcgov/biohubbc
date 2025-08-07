import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/http-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { AdministrativeActivityService } from '../../services/administrative-activity-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/administrative-activity/invited');

export const POST: Operation = [
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
  createInvitedAccessRequest()
];

POST.apiDoc = {
  description: 'Create a new invited Administrative Activity for users invited via email.',
  tags: ['admin'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Invited Administrative Activity post request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'Invited Administrative Activity request object',
          type: 'object',
          additionalProperties: false,
          required: ['systemUserId', 'userGuid', 'email'],
          properties: {
            systemUserId: { type: 'number', description: 'The system user ID for the invited user.' },
            reason: { type: 'string', description: 'Reason for the invitation.' },
            userGuid: { type: 'string', description: 'Unique keycloak GUID for the user.' },
            name: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            identitySource: { type: 'string', description: 'Whether the account is an IDIR or BCeID.' },
            company: { type: 'string', description: 'The company that the user belongs to.', nullable: true },
            displayName: { type: 'string' }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Invited administrative activity post response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Invited Administrative Activity Response Object',
            type: 'object',
            additionalProperties: false,
            required: ['id', 'date'],
            properties: {
              id: {
                type: 'number'
              },
              date: {
                description: 'The date this administrative activity was made',
                type: 'string'
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
 * Creates a new administrative activity for an invited access request.
 *
 * @returns {RequestHandler}
 */
export function createInvitedAccessRequest(): RequestHandler {
  return async (req, res) => {
    const systemUserId = req.body.systemUserId;

    if (!systemUserId) {
      throw new HTTP400('Missing required systemUserId');
    }

    // Extract user data from request body (excluding systemUserId)
    const { systemUserId: _, ...userData } = req.body;

    if (!userData.email) {
      throw new HTTP400('Missing required email');
    }

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const administrativeActivityService = new AdministrativeActivityService(connection);

      const response = await administrativeActivityService.createInvitedAccessRequest(systemUserId, userData);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'createInvitedAccessRequest', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
