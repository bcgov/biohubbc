import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/http-error';
import { queries } from '../../../queries/queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/draft');

export const PUT: Operation = [
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
  updateDraft()
];

const postPutResponses = {
  200: {
    description: 'Draft post response object.',
    content: {
      'application/json': {
        schema: {
          title: 'Draft Response Object',
          type: 'object',
          required: ['webform_draft_id', 'name', 'create_date', 'update_date'],
          properties: {
            webform_draft_id: {
              type: 'number'
            },
            name: {
              type: 'string',
              description: 'The name of the draft'
            },
            create_date: {
              oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
              description: 'ISO 8601 date string for the date the draft was created'
            },
            update_date: {
              oneOf: [
                { type: 'object', nullable: true },
                { type: 'string', format: 'date' }
              ],
              description: 'ISO 8601 date string for the date the draft was updated'
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
};

PUT.apiDoc = {
  description: 'Update a Draft',
  tags: ['draft'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Draft put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Draft request object',
          type: 'object',
          required: ['name', 'data'],
          properties: {
            id: {
              title: 'Draft record ID',
              type: 'number'
            },
            name: {
              title: 'Draft name',
              type: 'string'
            },
            data: {
              title: 'Draft json data',
              type: 'object'
            }
          }
        }
      }
    }
  },
  responses: {
    ...postPutResponses
  }
};

/**
 * Updates an existing draft record.
 *
 * @returns {RequestHandler}
 */
export function updateDraft(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      if (!req.body.id) {
        throw new HTTP400('Missing required param id');
      }

      if (!req.body.name) {
        throw new HTTP400('Missing required param name');
      }

      if (!req.body.data) {
        throw new HTTP400('Missing required param data');
      }

      const putDraftSQLStatement = queries.project.draft.putDraftSQL(req.body.id, req.body.name, req.body.data);

      if (!putDraftSQLStatement) {
        throw new HTTP400('Failed to build SQL update statement');
      }

      await connection.open();

      const updateDraftResponse = await connection.query(putDraftSQLStatement.text, putDraftSQLStatement.values);

      const draftResult = (updateDraftResponse && updateDraftResponse.rows && updateDraftResponse.rows[0]) || null;
      if (!draftResult || !draftResult.id) {
        throw new HTTP400('Failed to update draft');
      }

      await connection.commit();

      return res.status(200).json({
        id: draftResult.id,
        name: draftResult.name,
        date: draftResult.update_date || draftResult.create_date
      });
    } catch (error) {
      defaultLog.error({ label: 'createProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
