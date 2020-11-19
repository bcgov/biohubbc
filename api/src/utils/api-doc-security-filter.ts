import { getLogger } from './logger';

/**
 * Apply updates/filters to req.apiDoc before it is returned by the `/api/api-docs/` endpoint.
 *
 * @export
 * @param {*} req
 * @return {*} req
 */
export async function applyApiDocSecurityFilters(req: any) {
  return req;
}
