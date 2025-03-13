import { AsyncLocalStorage } from 'async_hooks';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getUserIdentifier } from './keycloak-utils';

const DEFAULT_REQUEST_STORE_VALUE = 'SYSTEM';

// Request store keys
export type RequestStoreKey = 'requestId' | 'username';

// Map (Store) for request metadata
// Note: Intentionally using type `string` for values to restrict the potential data types,
// trying to keep this as lightweight as possible.
export type RequestStore = Map<RequestStoreKey, string>;

// Initialize the request storage to track request metadata
export const AsyncRequestStorage = new AsyncLocalStorage<RequestStore>();

/**
 * Middleware to initialize the async request storage.
 *
 * Why? This allows us to store request-specific data (ie: request id, username) in a key-value store
 * that is accessible to all downstream code for the current request.
 *
 * Note: Must be initialized BEFORE any other middleware that requires the request storage.
 * Specifically, this should be the first middleware in the middleware stack.
 * ie: Inside the openapi 'x-express-openapi-additional-middleware' array.
 *
 * @see https://nodejs.org/api/async_context.html#class-asynclocalstorage
 *
 * @param {Request} req
 * @param {Response} _res
 * @param {NextFunction} next
 * @return {*} {void}
 */
export function initRequestStorage(req: Request, _res: Response, next: NextFunction) {
  const requestStore: RequestStore = new Map();

  // Generate the request id for the current request - unique for each request
  requestStore.set('requestId', uuid());

  if (req.keycloak_token) {
    // Set the username of the user who made the current request
    requestStore.set('username', getUserIdentifier(req.keycloak_token));
  }

  // Note: Must call `next()` within the `AsyncRequestStorage` callback to ensure
  // the request store is available to all subsequent middleware and routes
  AsyncRequestStorage.run(requestStore, () => {
    next();
  });
}

/**
 * Private helper to get a value from the request store.
 *
 * Note: Returns a default value if the request store is not initialized or the key is not found.
 *
 * @param {RequestStoreKey} key - The request store key to get the value for
 * @param {string} defaultValue - The default value to return if the key is not found
 * @return {*} {string}
 */
export function _getRequestStoreValue(key: RequestStoreKey, defaultValue: string): string {
  const requestStore = AsyncRequestStorage.getStore();

  // Return undefined if the request store is not initialized
  if (!requestStore) {
    return defaultValue;
  }

  return requestStore.get(key) ?? defaultValue;
}

/**
 * Get the request id of the current request.
 *
 * Note: Falls back to 'SYSTEM' if the request store is not initialized.
 *
 * @example 'd3d3b4d3-7b3d-4b3d-8b3d-3d3b4d3b3d3b'
 * @return {*} {string}
 */
export function getRequestId(): string {
  return _getRequestStoreValue('requestId', DEFAULT_REQUEST_STORE_VALUE);
}

/**
 * Get the user who made the request.
 *
 * Note: Falls back to 'SYSTEM' if the request store is not initialized.
 *
 * @example 'SBRULE'
 * @return {*} {string}
 */
export function getRequestUser(): string {
  return _getRequestStoreValue('username', DEFAULT_REQUEST_STORE_VALUE);
}
