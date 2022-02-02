import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/custom-error';
import { GCNotifyService } from '../services/gcnotify-service';
import { ACCESS_REQUEST_APPROVAL_ADMIN_EMAIL } from '../constants/notifications';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { UserService } from '../services/user-service';
import { getLogger } from '../utils/logger';
import { updateAdministrativeActivity } from './administrative-activity';
import { queries } from '../queries/queries';
import { ApiBuildSQLError } from '../errors/custom-error';

const defaultLog = getLogger('paths/access-request');

const APP_HOST = process.env.APP_HOST;
const NODE_ENV = process.env.NODE_ENV;

export const PUT: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  updateAccessRequest()
];

PUT.apiDoc = {
  description: "Update a user's system access request and add any specified system roles to the user.",
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['userIdentifier', 'identitySource', 'requestId', 'requestStatusTypeId'],
          properties: {
            userIdentifier: {
              type: 'string',
              description: 'The user identifier for the user.'
            },
            identitySource: {
              type: 'string',
              description: 'The identity source for the user.'
            },
            requestId: {
              type: 'number',
              description: 'The id of the access request to update.'
            },
            requestStatusTypeId: {
              type: 'number',
              description: 'The status type id to set for the access request.'
            },
            roleIds: {
              type: 'array',
              items: {
                type: 'number'
              },
              description:
                'An array of role ids to add, if the access-request was approved. Ignored if the access-request was denied.'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Add system user roles to user OK.'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
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
 * Updates an access request.
 *
 * key steps performed:
 * - Get the user by their user identifier
 * - If user is not found, add them
 * - Determine if there are any new roles to add, and add them if there are
 * - Update the administrative activity record status
 *
 * @return {*}  {RequestHandler}
 */
export function updateAccessRequest(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'updateAccessRequest', message: 'params', req_body: req.body });

    const userIdentifier = req.body?.userIdentifier || null;
    const identitySource = req.body?.identitySource || null;
    const administrativeActivityId = Number(req.body?.requestId) || null;
    const administrativeActivityStatusTypeId = Number(req.body?.requestStatusTypeId) || null;
    const roleIds: number[] = req.body?.roleIds || [];

    if (!userIdentifier) {
      throw new HTTP400('Missing required body param: userIdentifier');
    }

    if (!identitySource) {
      throw new HTTP400('Missing required body param: identitySource');
    }

    if (!administrativeActivityId) {
      throw new HTTP400('Missing required body param: requestId');
    }

    if (!administrativeActivityStatusTypeId) {
      throw new HTTP400('Missing required body param: requestStatusTypeId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userService = new UserService(connection);

      // Get the system user (adding or activating them if they already existed).
      const systemUserObject = await userService.ensureSystemUser(userIdentifier, identitySource);

      // Filter out any system roles that have already been added to the user
      const rolesIdsToAdd = roleIds.filter((roleId) => !systemUserObject.role_ids.includes(roleId));

      if (rolesIdsToAdd?.length) {
        // Add any missing roles (if any)
        await userService.addUserSystemRoles(systemUserObject.id, rolesIdsToAdd);
      }

      // Update the access request record status
      await updateAdministrativeActivity(administrativeActivityId, administrativeActivityStatusTypeId, connection);

      await connection.commit();

      checkIfAccessRequestIsApproval(administrativeActivityStatusTypeId, req['keycloak_token']);

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateAccessRequest', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

async function checkIfAccessRequestIsApproval(adminActivityTypeId: number, keycloak_token: object) {
  const connection = getDBConnection(keycloak_token);

  const admintActivityStatusTypeSQLStatment = queries.administrativeActivity.getAdministrativeActivitiesTypeNameSQL(
    adminActivityTypeId
  );

  if (!admintActivityStatusTypeSQLStatment) {
    throw new ApiBuildSQLError('Failed to build SQL select statement');
  }

  await connection.open();

  const response = await connection.query(
    admintActivityStatusTypeSQLStatment.text,
    admintActivityStatusTypeSQLStatment.values
  );

  if (response.rows[0].name === 'Actioned') {
    sendAccessRequestApprovalEmail();
  }
}

function sendAccessRequestApprovalEmail() {
  const gcnotifyService = new GCNotifyService();
  const url = `${APP_HOST}/`;
  const hrefUrl = `[click here.](${url})`;

  gcnotifyService.sendEmailGCNotification('Kjartan.Einarsson@gov.bc.ca', {
    ...ACCESS_REQUEST_APPROVAL_ADMIN_EMAIL,
    subject: `${NODE_ENV}: ${ACCESS_REQUEST_APPROVAL_ADMIN_EMAIL.subject}`,
    body1: `${ACCESS_REQUEST_APPROVAL_ADMIN_EMAIL.body1} ${hrefUrl}`,
    footer: `${APP_HOST}`
  });
}
