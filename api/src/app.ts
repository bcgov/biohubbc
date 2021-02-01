import bodyParser from 'body-parser';
import express from 'express';
import { initialize } from 'express-openapi';
import { OpenAPI } from 'openapi-types';
import { apiDoc } from './openapi/api';
import { applyApiDocSecurityFilters } from './security/api-doc-security-filter';
import { authenticate } from './security/auth-utils';
import { getLogger } from './utils/logger';

const defaultLog = getLogger('app');

const HOST = process.env.API_HOST;
const PORT = Number(process.env.API_PORT);

const BODY_SIZE_LIMIT: string = process.env.BODY_SIZE_LIMIT || '50mb';

// Get initial express app
const app: express.Express = express();

// Enable CORS
app.use(function (req: any, res: any, next: any) {
  defaultLog.info(`${req.method} ${req.url}`);

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, responseType');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'max-age=4');

  next();
});

// Initialize express-openapi framework
initialize({
  apiDoc: apiDoc as OpenAPI.Document, // base open api spec
  app: app, // express app to initialize
  paths: './src/paths', // base folder for endpoint routes
  pathsIgnore: new RegExp('.(spec|test)$'), // ignore test files in paths
  routesGlob: '**/*.{ts,js}', // updated default to allow .ts
  routesIndexFileRegExp: /(?:index)?\.[tj]s$/, // updated default to allow .ts
  promiseMode: true, // allow endpoint handlers to return promises
  consumesMiddleware: {
    'application/json': bodyParser.json({ limit: BODY_SIZE_LIMIT }),
    'application/x-www-form-urlencoded': bodyParser.urlencoded({ limit: BODY_SIZE_LIMIT, extended: true })
  },
  securityHandlers: {
    // applies authentication logic
    Bearer: function (req, scopes) {
      return authenticate(req, scopes);
    }
  },
  securityFilter: async (req, res) => {
    // applies modifications to the api-doc before being returned via the `/api-docs` endpoint
    const modifiedApiDoc = await applyApiDocSecurityFilters(req);
    res.status(200).json(modifiedApiDoc);
  },
  errorTransformer: function (openapiError: object, ajvError: object): object {
    // Transform openapi-request-validator and openapi-response-validator errors
    defaultLog.error({ label: 'errorTransformer', message: 'ajvError', ajvError });
    return ajvError;
  },
  // If `next` is not inclduded express will silently skip calling the `errorMiddleware` entirely.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorMiddleware: function (error, req, res, next) {
    if (!error.status) {
      // TODO some unplanned errors do have a status, maybe change status to code for intentional errors?
      // log any unintentionally thrown errors (where no status has been set)
      defaultLog.error({ label: 'errorMiddleware', message: 'unexpected error', error });
    }

    res.status(error.status || 500).json(error);
  }
});

// Start api
try {
  app.listen(PORT, () => {
    defaultLog.info({ label: 'start api', message: `started api on ${HOST}:${PORT}/api` });
  });
} catch (error) {
  defaultLog.error({ label: 'start api', message: 'error', error });
  process.exit(1);
}
