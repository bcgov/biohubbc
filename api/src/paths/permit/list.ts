import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/http-error';
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
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  listUserPermits()
];

GET.apiDoc = {
  description: 'Fetches a list of permits that the logged in user is associated with.',
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
            type: 'object',
            required: ['permits'],
            properties: {
              permits: {
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
                      minimum: 0
                    }
                  }
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

export function listUserPermits(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      if (!systemUserId) {
        throw new HTTP400('Failed to identify system user ID');
      }

      const userPermitService = new PermitService(connection);

      const permits: IPermitModel[] = await userPermitService.getPermitByUser(systemUserId);

      await connection.commit();

      res.status(200).json({ permits: permits });
    } catch (error) {
      defaultLog.error({ label: 'listUserPermits', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
