import { Request, RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { KeycloakService } from '../services/keycloak-service';
import { HTTP403 } from './../errors/http-error';
import { authenticateRequest } from './../request-handlers/security/authentication';
import { authorizeRequest } from './../request-handlers/security/authorization';
import { getLogger } from './../utils/logger';

const defaultLog = getLogger('middleware/critterbase-proxy');
/**
 * Currently supported Critterbase delete endpoints.
 *
 */
const allowedDeleteRoutesRegex: RegExp[] = [
  /**
   * example: allows requests to /api/critterbase/captures/:id
   * but rejects requests to /api/critterbase/captures/:id/other-path
   *
   */
  /^\/api\/critterbase\/captures\/[^/]+$/,
  /^\/api\/critterbase\/markings\/[^/]+$/,
  /^\/api\/critterbase\/family\/[^/]+$/,
  /^\/api\/critterbase\/measurements\/qualitative\/[^/]+$/,
  /^\/api\/critterbase\/measurements\/quantitative\/[^/]+$/,
  /^\/api\/critterbase\/collection-units\/[^/]+$/,
  /^\/api\/critterbase\/mortality\/[^/]+$/
];

/**
 * Filters requests coming into the CritterbaseProxy.
 * Handles different request methods differently. With extra
 * scrutiny around delete requests.
 *
 * @param {string} pathname - Critterbase pathname.
 * @param {Request} req - Express request.
 * @returns {boolean} If request can be passed to CritterbaeProxy.
 */
export const proxyFilter = (pathname: string, req: Request) => {
  // Reject requests NOT coming directly from SIMS APP / frontend.
  if (req.headers.host !== getSimsAppHost()) {
    defaultLog.debug({
      label: 'proxyFilter',
      message: `${req.method} ${pathname} -> Invalid origin: ${req.headers.origin}`
    });
    console.log(getSimsAppHost());

    return false;
  }
  // Only supporting specific delete requests.
  if (req.method === 'DELETE') {
    const allowed = allowedDeleteRoutesRegex.some((regex) => regex.test(pathname));

    if (!allowed) {
      defaultLog.debug({
        label: 'proxyFilter',
        message: `${req.method} ${pathname} -> Failed delete path regex`
      });
    }

    return allowed;
  }
  // Support all POST / PATCH / GET requests.
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'GET') {
    return true;
  }

  defaultLog.debug({
    label: 'proxyFilter',
    message: `${req.method} ${pathname} -> Unable to proxy request`
  });

  // Block all other requests.
  return false;
};

/**
 * Get the SIMS APP host without `https://`.
 *
 *
 * @return {*}
 */
export const getSimsAppHost = () => {
  return (process.env.APP_HOST as string).replace('https://', '');
};

/**
 * Get the Critterbase API host URL.
 *
 * @return {*}
 */
export const getCritterbaseApiHostUrl = () => {
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
  createProxyMiddleware(proxyFilter, {
    target: getCritterbaseApiHostUrl(),
    logLevel: 'warn',
    changeOrigin: true,
    pathRewrite: async (path) => {
      defaultLog.debug({ label: 'onCritterbaseProxyPathRewrite', message: 'path', req: path });

      const matchRoutePrefix = /\/api\/critterbase(\/?)(.*)/;
      return path.replace(matchRoutePrefix, '/$2');
    },
    onProxyReq: (client, req) => {
      defaultLog.debug({ label: 'onCritterbaseProxyRequest', message: 'path', req: req.path });

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
