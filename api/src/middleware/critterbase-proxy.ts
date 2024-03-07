import { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { KeycloakService } from '../services/keycloak-service';
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
  '/api/critterbase/xref/taxon-quantitative-measurements',
  '/api/critterbase/xref/taxon-qualitative-measurements',
  '/api/critterbase/xref/taxon-qualitative-measurement-options',
  '/api/critterbase/xref/measurements/search'
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
export const authorizeAndAuthenticateMiddleware: RequestHandler = async (req, _, next) => {
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

  next();
};

/**
 * Replaces the Authorization header with a service client bearer token.
 *
 * @param {*} req
 * @param {*} _
 * @param {*} next
 */
export const replaceAuthorizationHeaderMiddleware: RequestHandler = async (req, _, next) => {
  const keycloakService = new KeycloakService();
  const serviceClientToken = await keycloakService.getKeycloakServiceToken();

  delete req.headers['authorization'];
  delete req.headers['Authorization'];

  req.headers['authorization'] = `Bearer ${serviceClientToken}`;

  next();
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
    pathRewrite: async (path) => {
      defaultLog.debug({ label: 'pathRewrite', message: 'path', req: path });

      const matchRoutePrefix = /\/api\/critterbase(\/?)(.*)/;
      return path.replace(matchRoutePrefix, '/$2');
    },
    onProxyReq: (client, req) => {
      defaultLog.debug({ label: 'onProxyReq', message: 'path', req: req.path });

      // Set user header as required by Critterbase
      client.setHeader(
        'user',
        JSON.stringify({
          keycloak_guid: req['system_user']?.user_guid,
          username: req['system_user']?.user_identifier
        })
      );
    },
    onProxyRes: (proxyRes, _, res) => {
      if (proxyRes.statusCode === 401 || proxyRes.statusCode === 403) {
        // Return 401 and 403 errors as 500 so as not to confuse SIMS, which has special logic for handling 401 and 403
        // errors from its own API calls.
        res.status(500).send('Access Denied').end();
      }
    }
  });
