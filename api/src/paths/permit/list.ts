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
  description: 'Fetches a list of permits associated to a user.',
  tags: ['permits'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Permits list response.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: [
                'permit_id',
                'survey_id',
                'number',
                'type',
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
                survey_id: {
                  type: 'integer',
                  minimum: 1,
                  nullable: true
                },
                number: {
                  type: 'string'
                },
                type: {
                  type: 'string'
                },
                create_date: {
                  oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                  description: 'ISO 8601 date string for the permit create_date'
                },
                create_user: {
                  type: 'integer',
                  minimum: 1
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

export function listUserPermits(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userPermitService = new PermitService(connection);

      const permits: IPermitModel[] = await userPermitService.getPermitByUser();

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
