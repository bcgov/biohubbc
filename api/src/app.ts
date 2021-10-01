import express from 'express';
import { initialize } from 'express-openapi';
import multer from 'multer';
import { OpenAPI } from 'openapi-types';
import { initDBPool, defaultPoolConfig } from './database/db';
import { ensureCustomError } from './errors/CustomError';
import { rootAPIDoc } from './openapi/root-api-doc';
import { authenticate, authorize } from './security/auth-utils';
import { getLogger } from './utils/logger';

const defaultLog = getLogger('app');

const HOST = process.env.API_HOST;
const PORT = Number(process.env.API_PORT);

// Max size of the body of the request (bytes)
const MAX_REQ_BODY_SIZE = Number(process.env.MAX_REQ_BODY_SIZE) || 52428800;
// Max number of files in a single request
const MAX_UPLOAD_NUM_FILES = Number(process.env.MAX_UPLOAD_NUM_FILES) || 10;
// Max size of a single file (bytes)
const MAX_UPLOAD_FILE_SIZE = Number(process.env.MAX_UPLOAD_FILE_SIZE) || 52428800;

// Get initial express app
const app: express.Express = express();

// Enable CORS
app.use(function (req: any, res: any, next: any) {
  defaultLog.info(`${req.method} ${req.url}`);

  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, responseType');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  next();
});

// Initialize express-openapi framework
initialize({
  apiDoc: rootAPIDoc as OpenAPI.Document, // base open api spec
  app: app, // express app to initialize
  paths: './src/paths', // base folder for endpoint routes
  pathsIgnore: new RegExp('.(spec|test)$'), // ignore test files in paths
  routesGlob: '**/*.{ts,js}', // updated default to allow .ts
  routesIndexFileRegExp: /(?:index)?\.[tj]s$/, // updated default to allow .ts
  promiseMode: true, // allow endpoint handlers to return promises
  consumesMiddleware: {
    'application/json': express.json({ limit: MAX_REQ_BODY_SIZE }),
    'multipart/form-data': multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_FILE_SIZE }
    }).array('media', MAX_UPLOAD_NUM_FILES),
    'application/x-www-form-urlencoded': express.urlencoded({ limit: MAX_REQ_BODY_SIZE, extended: true })
  },
  securityHandlers: {
    // applies authentication logic
    Bearer: async function (req: any, scopes: string[]) {
      return (await authenticate(req)) && authorize(req, scopes);
    }
  },
  errorTransformer: function (openapiError: object, ajvError: object): object {
    // Transform openapi-request-validator and openapi-response-validator errors
    defaultLog.error({ label: 'errorTransformer', message: 'ajvError', ajvError });
    return ajvError;
  },
  // If `next` is not inclduded express will silently skip calling the `errorMiddleware` entirely.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorMiddleware: function (error, req, res, next) {
    // Ensure all errors (intentionally thrown or not) are in the same format as specified by the schema
    const httpError = ensureCustomError(error);

    res.status(httpError.status).json(httpError);
  }
});

// Start api
try {
  initDBPool(defaultPoolConfig);

  app.listen(PORT, () => {
    console.log('started');
    defaultLog.info({ label: 'start api', message: `started api on ${HOST}:${PORT}/api` });
  });
} catch (error) {
  defaultLog.error({ label: 'start api', message: 'error', error });
  process.exit(1);
}
