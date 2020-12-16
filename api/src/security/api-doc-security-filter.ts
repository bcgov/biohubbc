import { OpenAPI } from 'openapi-types';

/**
 * Apply updates/filters to req.apiDoc before it is returned by the `/api/api-docs/` endpoint.
 *
 * @export
 * @param {*} req
 * @return {*} apiDoc
 */
export function applyApiDocSecurityFilters(req: any): OpenAPI.Document {
  return req.apiDoc;
}
