import { RequestHandler } from 'express';
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
