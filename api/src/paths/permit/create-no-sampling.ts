import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/CustomError';
import { IPostPermitNoSampling, PostPermitNoSamplingObject } from '../../models/permit-no-sampling';
import { PostCoordinatorData } from '../../models/project-create';
import { PutCoordinatorData } from '../../models/project-update';
import { permitNoSamplingPostBody, permitNoSamplingResponseBody } from '../../openapi/schemas/permit-no-sampling';
import { postPermitNoSamplingSQL } from '../../queries/permit/permit-create-queries';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('/api/permit/create-no-sampling');

export const POST: Operation = [logRequest('/api/permit/create-no-sampling', 'POST'), createNoSamplePermits()];

POST.apiDoc = {
  description: 'Creates new no sample permit records.',
  tags: ['no-sample-permit'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'No sample permits post request object.',
    content: {
      'application/json': {
        schema: {
          ...(permitNoSamplingPostBody as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'No sample permits response object.',
      content: {
        'application/json': {
          schema: {
            ...(permitNoSamplingResponseBody as object)
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
 * Creates new no sample permit records.
 *
 * @returns {RequestHandler}
 */
export function createNoSamplePermits(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedNoSamplePermitPostData = new PostPermitNoSamplingObject(req.body);

    if (!sanitizedNoSamplePermitPostData.permit || !sanitizedNoSamplePermitPostData.permit.permits.length) {
      throw new HTTP400('Missing request body param `permit`');
    }

    if (!sanitizedNoSamplePermitPostData.coordinator) {
      throw new HTTP400('Missing request body param `coordinator`');
    }

    try {
      await connection.open();

      const result = await Promise.all(
        sanitizedNoSamplePermitPostData.permit.permits.map((permit: IPostPermitNoSampling) =>
          insertNoSamplePermit(permit, sanitizedNoSamplePermitPostData.coordinator, connection)
        )
      );

      await connection.commit();

      return res.status(200).json({ ids: result });
    } catch (error) {
      await connection.rollback();
      defaultLog.debug({ label: 'createNoSamplePermits', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const insertNoSamplePermit = async (
  permit: IPostPermitNoSampling,
  coordinator: PostCoordinatorData | PutCoordinatorData,
  connection: IDBConnection
): Promise<number> => {
  const systemUserId = connection.systemUserId();

  const sqlStatement = postPermitNoSamplingSQL({ ...permit, ...coordinator }, systemUserId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert non-sampling permit data');
  }

  return result.id;
};
