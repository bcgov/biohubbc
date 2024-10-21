import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import {
  ADMINISTRATIVE_ACTIVITY_STATUS_TYPE,
  ADMINISTRATIVE_ACTIVITY_TYPE
} from '../constants/administrative-activity';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { AdministrativeActivityService } from '../services/administrative-activity-service';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/administrative-activities');

export const GET: Operation = [
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
  getAdministrativeActivities()
];

export const getAllAdministrativeActivityTypes = (): string[] => Object.values(ADMINISTRATIVE_ACTIVITY_TYPE);

export const getAllAdministrativeActivityStatusTypes = (): string[] =>
  Object.values(ADMINISTRATIVE_ACTIVITY_STATUS_TYPE);

GET.apiDoc = {
  description: 'Get a list of administrative activities based on the provided criteria.',
  tags: ['admin'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'type',
      schema: {
        type: 'array',
        items: {
          type: 'string',
          enum: getAllAdministrativeActivityTypes()
        }
      }
    },
    {
      in: 'query',
      name: 'status',
      schema: {
        type: 'array',
        items: {
          type: 'string',
          enum: getAllAdministrativeActivityStatusTypes()
        }
      }
    }
  ],
  responses: {
    200: {
      description: 'List of administrative activities.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'type', 'type_name', 'status', 'status_name', 'create_date'],
              additionalProperties: true,
              properties: {
                id: {
                  type: 'number'
                },
                type: {
                  type: 'number'
                },
                type_name: {
                  type: 'string'
                },
                status: {
                  type: 'number'
                },
                status_name: {
                  type: 'string'
                },
                description: {
                  type: 'string',
                  nullable: true
                },
                data: {
                  type: 'object',
                  description: 'JSON data blob containing additional information about the activity record',
                  properties: {
                    // Don't specify as this is a JSON blob column
                  }
                },
                notes: {
                  type: 'string',
                  nullable: true
                },
                create_date: {
                  type: 'string',
                  description: 'ISO 8601 date string'
                },
                updated_by: {
                  type: 'string',
                  description: 'Display name of the user who last updated the record',
                  nullable: true
                },
                update_date: {
                  type: 'string',
                  description: 'Date when the record was last updated',
                  nullable: true
                }
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
 * Get all administrative activities for the specified type, or all if no type is provided.
 *
 * @returns {RequestHandler}
 */
export function getAdministrativeActivities(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      // Only search for specified types if provided, otherwise search all types
      const administrativeActivityTypes = (req.query.type as string[]) || getAllAdministrativeActivityTypes();

      // Only search for specified status types if provided, otherwise search all status types
      const administrativeActivityStatusTypes: string[] =
        (req.query.status as string[]) || getAllAdministrativeActivityStatusTypes();

      await connection.open();

      const administrativeActivityService = new AdministrativeActivityService(connection);

      const response = await administrativeActivityService.getAdministrativeActivities(
        administrativeActivityTypes,
        administrativeActivityStatusTypes
      );

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getAdministrativeActivities', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
