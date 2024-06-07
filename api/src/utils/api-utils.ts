import { Response } from 'express';
/**
 * Modify the response, setting the cache control header with the given max age.
 *
 * @param {Response} res
 * @param {number} maxAge cache control max age (seconds)
 */
export const setCacheControl = (res: Response, maxAge: number) => {
  res.setHeader('Cache-Control', `private, max-age=${maxAge}`);
};
