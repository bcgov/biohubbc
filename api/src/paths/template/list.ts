import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { TemplateService } from '../../services/template-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/template/list');

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
  getTemplates()
];

GET.apiDoc = {
  description: 'Gets the labels of the taxonomic units identified by the provided list of ids.',
  tags: ['templates'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Get All Templates Response',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              templates: {
                type: 'array',
                items: {
                  title: 'Templates',
                  type: 'object',
                  properties: {
                    template_id: {
                      type: 'string'
                    },
                    name: {
                      type: 'string'
                    },
                    version: {
                      type: 'string'
                    },
                    description: {
                      type: 'string'
                    },
                    key: {
                      type: 'string'
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
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get all templates
 *
 * @returns {RequestHandler}
 */
export function getTemplates(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    defaultLog.debug({ label: 'getTemplates', message: 'get all templates' });

    try {
      await connection.open();
      const templateService = new TemplateService(connection);
      const response = await templateService.getAllTemplates();

      await connection.commit();

      res.status(200).json({ templates: response });
    } catch (error) {
      defaultLog.error({ label: 'getTemplates', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
