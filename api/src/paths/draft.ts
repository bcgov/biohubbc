import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { draftResponseObject } from '../openapi/schemas/draft';
import { postDraftSQL, putDraftSQL } from '../queries/draft-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/draft');

export const PUT: Operation = [logRequest('paths/draft', 'PUT'), updateDraft()];
export const POST: Operation = [logRequest('paths/draft', 'POST'), createDraft()];

const postPutResponses = {
  200: {
    description: 'Draft post response object.',
    content: {
      'application/json': {
        schema: {
          ...(draftResponseObject as object)
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

POST.apiDoc = {
  description: 'Create a new Draft.',
  tags: ['draft'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Draft post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Draft request object',
          type: 'object',
          required: ['name', 'data'],
          properties: {
            name: {
              title: 'Draft name',
              type: 'string'
            },
            data: {
              title: 'Draft json data',
              type: 'object',
              properties: {}
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

PUT.apiDoc = {
  description: 'Update a Draft.',
  tags: ['draft'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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
              type: 'object',
              properties: {}
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
 * Creates a new draft record.
 *
 * @returns {RequestHandler}
 */
export function createDraft(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      if (!systemUserId) {
        throw new HTTP400('Failed to identify system user ID');
      }

      if (!req.body.name) {
        throw new HTTP400('Missing required param name');
      }

      if (!req.body.data) {
        throw new HTTP400('Missing required param data');
      }

      const postDraftSQLStatement = postDraftSQL(systemUserId, req.body.name, req.body.data);

      if (!postDraftSQLStatement) {
        throw new HTTP400('Failed to build SQL insert statement');
      }

      const createDraftResponse = await connection.query(postDraftSQLStatement.text, postDraftSQLStatement.values);

      await connection.commit();

      const draftResult = (createDraftResponse && createDraftResponse.rows && createDraftResponse.rows[0]) || null;

      if (!draftResult || !draftResult.id) {
        throw new HTTP400('Failed to save draft');
      }

      return res.status(200).json({ id: draftResult.id, date: draftResult.update_date || draftResult.create_date });
    } catch (error) {
      defaultLog.debug({ label: 'createProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

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

      const putDraftSQLStatement = putDraftSQL(req.body.id, req.body.name, req.body.data);

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

      return res.status(200).json({ id: draftResult.id, date: draftResult.update_date || draftResult.create_date });
    } catch (error) {
      defaultLog.debug({ label: 'createProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
