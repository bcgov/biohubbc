import express, { Request, Response } from 'express';
import { critterbase } from './constants';

export const critterbaseRouter = express.Router();
/*
 * Router for direct Critterbase calls
 */
critterbaseRouter
  .route('/*')
  .get(async (req: Request, res: Response) => {
    try {
      const { data } = await critterbase.get(req.url);
      return res.send(data);
    } catch (e) {
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
