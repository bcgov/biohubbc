import { NextFunction, Request, Response } from 'express';
import { NIL as ALL_ZEROS_UUID, v4 as uuid } from 'uuid';
import { AsyncRequestStorage } from '../app';

// Key for request-specific data
export type RequestStoreKey = 'requestId' | 'username';

// Key-value store for request-specific data
// Note: Intentionally using type string for values to restrict the potential data types,
// trying to keep this as lightweight as possible.
export type RequestStore = Map<RequestStoreKey, string>;

/**
 * Middleware to initialize the request storage for each request.
 *
 * Note: Must be called before any other middleware that requires the request storage.
 * ie: Inside the openapi 'x-express-openapi-additional-middleware' array.
 *
 * @param {Request} req
 * @param {Response} _res
 * @param {NextFunction} next
 * @return {*} {void}
 */
export function initRequestStorage(req: Request, _res: Response, next: NextFunction) {
  const requestStore: RequestStore = new Map();

  // Set the request id for the current request - unique for each request
  requestStore.set('requestId', uuid());

  // Set the username for the current request
  requestStore.set('username', req.keycloak_token?.idir_username ?? req.keycloak_token?.bceid_username);

  AsyncRequestStorage.run(requestStore, () => {
    // Note: Must call `next()` within the `AsyncRequestStorage` callback to ensure
    // the request store is available to all subsequent middleware and routes
    next();
  });
}

/**
 * Private helper to get a value from the request store.
 *
 * Note: Returns undefined if the request store is not initialized.
 *
 * @param {RequestStoreKey} key
 * @return {*} {string | undefined}
 */
export function _getRequestStoreValue(key: RequestStoreKey): string | undefined {
  const requestStore = AsyncRequestStorage.getStore();

  if (!requestStore) {
    return undefined;
  }

  return requestStore.get(key);
}

/**
 * Get the request id of the current request.
 *
 * @return {*} {string | undefined}
 */
export function getRequestId(): string | undefined {
  return _getRequestStoreValue('requestId') ?? ALL_ZEROS_UUID;
}

/**
 * Get the user who made the request.
 *
 * @example 'SBRULE'
 * @return {*} {string | undefined}
 */
export function getRequestUser(): string | undefined {
  return _getRequestStoreValue('username') ?? 'SIMS_API';
}
