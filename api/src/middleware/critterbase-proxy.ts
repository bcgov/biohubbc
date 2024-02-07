import { Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { HTTP403 } from './../errors/http-error';
import { authenticateRequest } from './../request-handlers/security/authentication';
import { authorizeRequest } from './../request-handlers/security/authorization';
import { getLogger } from './../utils/logger';

const defaultLog = getLogger('middleware/critterbase-proxy');

/**
 * Restrict the proxy to these Critterbase routes.
 */
const proxyRoutes = [
  '/api/critterbase/signup',
  '/api/critterbase/family',
  '/api/critterbase/family/:familyId',
  '/api/critterbase/lookups/:key',
  '/api/critterbase/xref/taxon-marking-body-locations',
  '/api/critterbase/xref/taxon-measurements',
  '/api/critterbase/xref/taxon-qualitative-measurement-options'
];

/**
 * Get the Critterbase API host URL.
 *
 * @return {*}
 */
const getCritterbaseApiHostUrl = () => {
  return process.env.CB_API_HOST;
};

/**
 * Authenticate and authorize the request.
 * Expects the request to have an Authorization header with a valid JWT Bearer token.
 *
 * @param {*} req
 */
const authorizeAndAuthenticate = async (req: Request) => {
  await authenticateRequest(req);

  req['authorization_scheme'] = {
    and: [
      {
        discriminator: 'SystemUser'
      }
    ]
  };

  const isAuthorized = await authorizeRequest(req);

  if (!isAuthorized) {
    defaultLog.warn({ label: 'authorize', message: 'User is not authorized' });
    throw new HTTP403('Access Denied');
  }
};

/**
 * Returns a middleware function that proxies requests to the critterbase service.
 *
 * Why? This allows the SIMS frontend to make requests to the Critterbase API, via the SIMS API, without the SIMS API
 * needing to re-define every Critterbase endpoint.
 */
export const getCritterbaseProxyMiddleware = () =>
  createProxyMiddleware(proxyRoutes, {
    target: getCritterbaseApiHostUrl(),
    changeOrigin: true,
    pathRewrite: async (path, req) => {
      defaultLog.debug({ label: 'pathRewrite', message: 'path', req: path });

      await authorizeAndAuthenticate(req);

      let matchRoutePrefix = new RegExp(`/api/critterbase(/?)(.*)`);
      return path.replace(matchRoutePrefix, '/$2');
    },
    onProxyReq: (client, req, res, options) => {
      defaultLog.debug({ label: 'onProxyReq', message: 'path', req: req.path });

      client.setHeader(
        'user',
        JSON.stringify({
          keycloak_guid: req['system_user']?.user_guid,
          username: req['system_user']?.user_identifier
        })
      );
    }
  });
