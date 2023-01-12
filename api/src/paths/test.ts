import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../database/db';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/drafts');

export const GET: Operation = [test()];

GET.apiDoc = {
  parameters: [
    {
      in: 'query',
      name: 'delay',
      schema: {
        type: 'number',
        minimum: 0
      }
    }
  ],
  responses: {
    200: {
      description: '200 OK'
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

export function test(): RequestHandler {
  return async (req, res) => {
    defaultLog.error({ label: 'test', message: 'start' });

    const delay = (req.params.delay && Number(req.params.delay)) || 0;

    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      defaultLog.error({ label: 'test', message: `start waiting for ${delay} milliseconds` });
      await waitForDelay(delay);

      await connection.commit();

      res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'test', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
      defaultLog.error({ label: 'test', message: 'finish' });
    }
  };
}

function waitForDelay(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), delay);
  });
}
