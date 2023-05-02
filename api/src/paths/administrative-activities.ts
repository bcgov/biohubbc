import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { getLogger } from '../utils/logger';
import { AdministrativeActivitiesService } from '../services/administrative-activities-service';

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

export enum ADMINISTRATIVE_ACTIVITY_TYPE {
  SYSTEM_ACCESS = 'System Access'
}

export const getAllAdministrativeActivityTypes = (): string[] => Object.values(ADMINISTRATIVE_ACTIVITY_TYPE);

export enum ADMINISTRATIVE_ACTIVITY_STATUS_TYPE {
  PENDING = 'Pending',
  ACTIONED = 'Actioned',
  REJECTED = 'Rejected'
}

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
                  oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                  description: 'ISO 8601 date string for the project start date'
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
 * Get all administrative activities for the specified type, or all if no type is provided.
 *
 * @returns {RequestHandler}
 */
export function getAdministrativeActivities(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const administrativeActivityTypes = (req.query.type as string[]) || getAllAdministrativeActivityTypes();

      const administrativeActivityStatusTypes: string[] =
        (req.query.status as string[]) || getAllAdministrativeActivityStatusTypes();

      await connection.open();

      const administrativeActivitiesService = new AdministrativeActivitiesService(connection);
      
      const response = await administrativeActivitiesService.getAdministrativeActivities(
        administrativeActivityTypes,
        administrativeActivityStatusTypes
      );

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getAdministrativeActivities', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
