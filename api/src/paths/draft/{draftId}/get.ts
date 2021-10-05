import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/CustomError';
import { draftGetResponseObject } from '../../../openapi/schemas/draft';
import { getDraftSQL } from '../../../queries/draft-queries';
import { getLogger } from '../../../utils/logger';
import { logRequest } from '../../../utils/path-utils';

const defaultLog = getLogger('paths/draft/{draftId}');

export const GET: Operation = [logRequest('paths/draft/{draftId}', 'GET'), getSingleDraft()];

GET.apiDoc = {
  description: 'Get a draft.',
  tags: ['draft'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'draftId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Draft with matching draftId.',
      content: {
        'application/json': {
          schema: {
            ...(draftGetResponseObject as object)
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
 * Get a draft by its id.
 *
 * @returns {RequestHandler}
 */
export function getSingleDraft(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getDraftSQLStatement = getDraftSQL(Number(req.params.draftId));

      if (!getDraftSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const draftResponse = await connection.query(getDraftSQLStatement.text, getDraftSQLStatement.values);

      await connection.commit();

      const draftResult = (draftResponse && draftResponse.rows && draftResponse.rows[0]) || null;

      return res.status(200).json(draftResult);
    } catch (error) {
      defaultLog.error({ label: 'getSingleDraft', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
