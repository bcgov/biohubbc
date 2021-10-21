import { Request, RequestHandler } from 'express';
import { HTTP403 } from '../errors/CustomError';
import { getLogger } from './logger';

/**
 * Logs the contents of the request parms and body, if LOG_LEVEL='debug'.
 *
 * @export
 * @param {string} callingFilePath a string that indicates which file is makign the call. ex: 'paths/endpoint'
 * @param {string} httpOperation the HTTP operation being performed. ex: 'POST'
 * @return {*}  {RequestHandler}
 */
export function logRequest(callingFilePath: string, httpOperation: string): RequestHandler {
  const defaultLog = getLogger(callingFilePath);

  return async (req, res, next) => {
    defaultLog.debug({ label: httpOperation, message: 'request', 'req.params': req.params, 'req.body': req.body });

    next();
  };
}

export type PermissionCheckFunction = (req: Request) => Promise<boolean>;

/**
 * A `RequestHandler` that executes a `PermissionCheckFunction` function, and based on the response, either calls
 * `next()` or throws an `HTTP403` Access Denied error.
 *
 * @export
 * @param {PermissionCheckFunction} permissionCheckFunction
 * @return {*}  {RequestHandler}
 */
export function checkPermissions(permissionCheckFunction: PermissionCheckFunction): RequestHandler {
  return async (req, res, next) => {
    try {
      const hasPermission = await permissionCheckFunction(req);

      if (!hasPermission) {
        throw new HTTP403('Access Denied');
      }

      next();
    } catch (error) {
      throw new HTTP403('Access Denied');
    }
  };
}
