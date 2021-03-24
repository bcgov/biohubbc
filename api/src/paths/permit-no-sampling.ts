import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../constants/roles';
import { getDBConnection, IDBConnection } from '../database/db';
import { IPostPermitNoSampling, PostPermitNoSamplingObject } from '../models/permit-no-sampling';
import { PostCoordinatorData } from '../models/project-create';
import { permitNoSamplingPostBody, permitNoSamplingResponseBody } from '../openapi/schemas/permit-no-sampling';
import { postPermitNoSamplingSQL } from '../queries/permit-no-sampling/permit-no-sampling-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/permit-no-sampling');

export const POST: Operation = [logRequest('paths/permit-no-sampling', 'POST'), createNoSamplePermits()];

POST.apiDoc = {
  description: 'Creates new no sample permit records.',
  tags: ['no-sample-permit'],
  security: [
    {
      Bearer: WRITE_ROLES
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
    503: {
      $ref: '#/components/responses/503'
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
function createNoSamplePermits(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedNoSamplePermitPostData = new PostPermitNoSamplingObject(req.body);

    try {
      await connection.open();

      const result = await Promise.all(
        sanitizedNoSamplePermitPostData.permit.permits.map((permit: IPostPermitNoSampling) =>
          insertNoSamplePermitNumber(permit, sanitizedNoSamplePermitPostData.coordinator, connection)
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

export const insertNoSamplePermitNumber = async (
  permit: IPostPermitNoSampling,
  coordinator: PostCoordinatorData,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postPermitNoSamplingSQL({ ...permit, ...coordinator });

  if (!sqlStatement) {
    throw {
      status: 400,
      message: 'Failed to build SQL statement'
    };
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw {
      status: 400,
      message: 'Failed to insert into no_sample_permit table'
    };
  }

  return result.id;
};
