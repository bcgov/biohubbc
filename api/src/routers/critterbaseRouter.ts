import { AxiosRequestConfig } from 'axios';
import express, { Request, Response } from 'express';
import { critterbase } from './constants';

export const critterbaseRouter = express.Router();
/*
 * Router for direct Critterbase calls
 */
// const getCbHeaders = (req: Request): AxiosRequestConfig => {
//   const keycloak_uuid = req.headers['keycloak-uuid'];
//    const user_id = req.headers['user_id'];
//   console.log('Here are the defaults: ' + JSON.stringify(critterbase.defaults.headers));
//   return { headers: { ...critterbase.defaults.headers } };
// };

const setHeaders = (config: AxiosRequestConfig, req: Request, headers: string[]) => {
  headers.forEach((head) => {
    if (req.headers?.[head]) {
      config.headers[head] = req.headers[head];
    }
  });
  return config;
};

critterbaseRouter
  .all('*', async (req: Request, res: Response, next) => {
    critterbase.interceptors.request.use((config) => setHeaders(config, req, ['keycloak-uuid', 'user-id', 'api-key']));
    next();
  })
  .route('/*')
  .get(async (req: Request, res: Response) => {
    try {
      const { data } = await critterbase.get(req.url);
      return res.send(data);
    } catch (e) {
      console.log(JSON.stringify(e));
      res.status(500).send(JSON.stringify(e));
    }
  })
  .post(async (req: Request, res: Response) => {
    // console.log(req.headers);
    const { data } = await critterbase.post(req.url, req.body);
    return res.send(data);
  })
  .patch(async (req: Request, res: Response) => {
    const { data } = await critterbase.patch(req.url, req.body);
    return res.send(data);
  })
  .delete(async (req: Request, res: Response) => {
    const { data } = await critterbase.delete(req.url);
    return res.send(data);
  });
