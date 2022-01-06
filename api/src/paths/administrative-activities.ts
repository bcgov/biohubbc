import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/administrative-activities');

export const GET: Operation = [
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
  getAdministrativeActivities()
];

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
        type: 'string',
        enum: ['System Access']
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
              properties: {
                id: {
                  type: 'number',
                  description: 'Administrative activity row ID'
                },
                type: {
                  type: 'number',
                  description: 'Administrative activity type ID'
                },
                type_name: {
                  type: 'string',
                  description: 'Administrative activity type name'
                },
                status: {
                  type: 'number',
                  description: 'Administrative activity status type ID'
                },
                status_name: {
                  type: 'string',
                  description: 'Administrative activity status type name'
                },
                description: {
                  type: 'string'
                },
                notes: {
                  type: 'string'
                },
                data: {
                  type: 'object',
                  description: 'JSON data blob containing additional information about the activity record',
                  properties: {
                    // Don't specify as this is a JSON blob column
                  }
                },
                create_date: {
                  type: 'string'
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
      const administrativeActivityTypeName = (req.query?.type as string) || undefined;

      const administrativeActivityStatusTypes: string[] =
        (req.query?.status as string[]) || getAllAdministrativeActivityStatusTypes();

      const sqlStatement = queries.administrativeActivity.getAdministrativeActivitiesSQL(
        administrativeActivityTypeName,
        administrativeActivityStatusTypes
      );

      if (!sqlStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      await connection.commit();

      const result = (response && response.rowCount && response.rows) || [];

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getAdministrativeActivities', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
