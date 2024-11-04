import { z } from 'zod';

// Global variable to store parsed environment configuration
let ENV: ENVConfig;

const IS_TEST_ENVIRONMENT =
  process.env.NODE_ENV === 'test' ||
  process.env.npm_lifecycle_event === 'test' ||
  process.env.npm_lifecycle_event === 'test-watch' ||
  process.env.npm_lifecycle_event === 'coverage';

// Custom Zod string type for environment variables ie: HOST=' ' || HOST='' === 'Required'
const ZodENVString = z.string().trim().min(1, { message: 'Required' });

// Schema for environment configuration
const ENVConfigSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NODE_OPTIONS: ZodENVString,
  TZ: z.literal('America/Vancouver'),

  // API server
  API_HOST: ZodENVString,
  API_PORT: ZodENVString,

  // Database
  DB_HOST: ZodENVString,
  DB_PORT: z.coerce.number(),
  DB_USER_API: ZodENVString,
  DB_USER_API_PASS: ZodENVString,
  DB_DATABASE: ZodENVString,

  DB_POOL_SIZE: z.coerce.number().default(20), // TODO: CI/CD ENV value does not exist
  DB_CONNECTION_TIMEOUT: z.coerce.number().default(0), // TODO: CI/CD ENV value does not exist
  DB_IDLE_TIMEOUT: z.coerce.number().default(10000), // TODO: CI/CD ENV value does not exist

  // Logging
  LOG_LEVEL: z.enum(['silent', 'error', 'warn', 'info', 'debug', 'silly']),
  LOG_LEVEL_FILE: z.enum(['silent', 'error', 'warn', 'info', 'debug', 'silly']),
  LOG_FILE_DIR: ZodENVString,
  LOG_FILE_NAME: ZodENVString,
  LOG_FILE_DATE_PATTERN: ZodENVString,
  LOG_FILE_MAX_SIZE: ZodENVString,
  LOG_FILE_MAX_FILES: ZodENVString,

  // Validation
  API_RESPONSE_VALIDATION_ENABLED: z.enum(['true', 'false']).transform((value) => value === 'true'),
  DATABASE_RESPONSE_VALIDATION_ENABLED: z.enum(['true', 'false']).transform((value) => value === 'true'),

  // File upload limits
  MAX_REQ_BODY_SIZE: z.coerce.number(),
  MAX_UPLOAD_NUM_FILES: z.coerce.number(),
  MAX_UPLOAD_FILE_SIZE: z.coerce.number(),

  // External Services
  CB_API_HOST: ZodENVString,
  APP_HOST: ZodENVString,

  // Biohub
  BACKBONE_INTERNAL_API_HOST: ZodENVString,
  BACKBONE_PUBLIC_API_HOST: ZodENVString,
  BACKBONE_INTAKE_PATH: ZodENVString,
  BACKBONE_ARTIFACT_INTAKE_PATH: ZodENVString,
  BIOHUB_TAXON_PATH: ZodENVString,
  BIOHUB_TAXON_TSN_PATH: ZodENVString,

  // Object Store
  OBJECT_STORE_URL: ZodENVString,
  OBJECT_STORE_ACCESS_KEY_ID: ZodENVString,
  OBJECT_STORE_SECRET_KEY_ID: ZodENVString,
  OBJECT_STORE_BUCKET_NAME: ZodENVString,
  S3_KEY_PREFIX: ZodENVString,

  // GCNotify
  GCNOTIFY_SECRET_API_KEY: ZodENVString,
  GCNOTIFY_ADMIN_EMAIL: ZodENVString,
  GCNOTIFY_ONBOARDING_REQUEST_EMAIL_TEMPLATE: z.string().uuid(),
  GCNOTIFY_ONBOARDING_REQUEST_SMS_TEMPLATE: z.string().uuid(),
  GCNOTIFY_REQUEST_RESUBMIT_TEMPLATE: z.string().uuid(),
  GCNOTIFY_EMAIL_URL: ZodENVString,
  GCNOTIFY_SMS_URL: ZodENVString,

  // Extra
  FEATURE_FLAGS: ZodENVString.transform((value) => value.split(',')).pipe(z.string().array()).optional() // prettier-ignore
});

type ENVConfig = z.infer<typeof ENVConfigSchema>;

/**
 * Get or set ENV config.
 *
 * Note: When setting variables, the new values are injected into the `process.env` and the global ENV variable.
 * This is to ensure that the new values are available to the rest of the application, and prevent unnecessary
 * parsing of the environment variables. ie: parsed once on startup vs on every function call.
 *
 * @example set value(s): ENVConfig({ NODE_ENV: 'example', ... });
 * @example get values: ENVConfig();
 *
 * @param {Partial<ENVConfig>} [config] - Optional ENV values to set
 * @returns {*} {ENVConfig} - Parsed ENV values
 */
export function ENVConfig(config?: Partial<ENVConfig>): ENVConfig {
  if (config) {
    // Inject the new values into the process.env
    Object.assign(process.env, config);

    // Inject the new values into global ENV variable
    ENV = Object.assign(ENV ?? {}, config);
  }

  return ENV;
}

// If TEST, skip parsing and enable minimum ENV variables for test suite
if (IS_TEST_ENVIRONMENT) {
  ENVConfig({ NODE_ENV: 'test', LOG_FILE_DIR: 'data/logs' });
} else {
  // Parse the environment variables against the schema (test environment allows partial values)
  const parsedENV = ENVConfigSchema.safeParse(process.env);

  // If the environment variables are invalid, log the error and crash the server
  if (!parsedENV.success) {
    //WARNING: Intentionally crashes the server if the environment variables are invalid.
    console.error('FATAL: Invalid environment variables:', parsedENV.error.flatten().fieldErrors);

    process.exit(1);
  }

  // Update the global ENV variable
  ENV = parsedENV.data as ENVConfig;
}
