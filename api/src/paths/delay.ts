import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../database/db';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/drafts');

export const GET: Operation = [delay()];

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

export function delay(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'delay', message: 'start' });

    const delay = (req.query.delay && Number(req.query.delay)) || 0;

    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      defaultLog.debug({ label: 'delay', message: `start waiting for ${delay} milliseconds` });
      await waitForDelay(delay);
      defaultLog.debug({ label: 'delay', message: `waiting finished` });

      await connection.commit();

      res.status(200).send('finish');
    } catch (error) {
      defaultLog.error({ label: 'delay', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
      defaultLog.debug({ label: 'delay', message: 'finish' });
    }
  };
}

function waitForDelay(delay: number) {
  return new Promise((resolve) => {
    const initialTime = new Date().valueOf();

    while (initialTime + delay > new Date().valueOf()) {
      // do nothing
    }

    resolve(undefined);
  });
}
