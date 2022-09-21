import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IPermitModel } from '../../repositories/permit-repository';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { PermitService } from '../../services/permit-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('/api/permits');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.PROJECT_CREATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  listUserPermits()
];

GET.apiDoc = {
  description: 'Fetches a list of permits for a user.',
  tags: ['permits'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Permits get response array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Survey permit Get Response Object',
              type: 'object',
              required: [
                'permit_id',
                'number',
                'type',
                'coordinator_first_name',
                'coordinator_last_name',
                'coordinator_email_address',
                'coordinator_agency_name',
                'issue_date',
                'end_date',
                'create_date',
                'create_user',
                'update_date',
                'update_user',
                'revision_count'
              ],
              properties: {
                permit_id: {
                  type: 'integer',
                  minimum: 1
                },
                number: {
                  type: 'string'
                },
                type: {
                  type: 'string'
                },
                coordinator_first_name: {
                  type: 'string',
                  nullable: true
                },
                coordinator_last_name: {
                  type: 'string',
                  nullable: true
                },
                coordinator_email_address: {
                  type: 'string',
                  nullable: true
                },
                coordinator_agency_name: {
                  type: 'string',
                  nullable: true
                },
                issue_date: {
                  type: 'string',
                  nullable: true
                },
                end_date: {
                  type: 'string',
                  nullable: true
                },
                create_date: {
                  oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                  description: 'ISO 8601 date string for the permit create_date'
                },
                create_user: {
                  type: 'integer',
                  nullable: true
                },
                update_date: {
                  oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                  description: 'ISO 8601 date string for the permit update_date',
                  nullable: true
                },
                update_user: {
                  type: 'integer',
                  nullable: true
                },
                revision_count: {
                  type: 'integer',
                  nullable: true
                }
              }
            },
            description: 'Permits applicable for the survey'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function listUserPermits(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userPermitService = new PermitService(connection);

      const permits: IPermitModel[] = await userPermitService.getPermitByUser();

      console.log('permits per user', permits)

      await connection.commit();

      res.status(200).json(permits);
    } catch (error) {
      defaultLog.error({ label: 'listSurveyPermits', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
