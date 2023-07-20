import { Operation } from 'express-openapi';
// import { SYSTEM_ROLE } from '../../constants/roles';
// import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { Request, RequestHandler, Response } from 'express';
import { critterbase } from '../../routers/constants';
import { AxiosRequestConfig } from 'axios';

const setHeaders = (config: AxiosRequestConfig, req: Request, headers: string[]) => {
  headers.forEach((head) => {
    if (req.headers?.[head]) {
      config.headers[head] = req.headers[head];
    }
  });
  return config;
};

const getCb = (): RequestHandler => {
  return async (req: Request, res: Response) => {
    try {
      critterbase.interceptors.request.use((config) =>
        setHeaders(config, req, ['keycloak-uuid', 'user-id', 'api-key'])
      );
      const modifiedUrl = String(req.url).replace('/api/critterbase/', '');
      const { data } = await critterbase.get(modifiedUrl);
      return res.send(data);
    } catch (e) {
      console.log(JSON.stringify(e));
      return res.status(500).send(JSON.stringify(e));
    }
  };
};

export const GET: Operation = [getCb()]