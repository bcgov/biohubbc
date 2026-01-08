import { z } from 'zod';
import { getLogger } from './logger';

const defaultLog = getLogger('src/utils/env-config.ts');

const ZodEnvString = z.string().trim().min(1, { message: 'Required' }); // '' or ' ' are invalid
const ZodEnvNumber = z.coerce.number().min(1, { message: 'Required and must be a positive value.' }); // -1 is invalid

// Schema for environment configuration
export const EnvSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NODE_OPTIONS: ZodEnvString,
  TZ: z.literal('America/Vancouver'),

  // API server
  API_HOST: ZodEnvString,
  API_PORT: ZodEnvNumber,

  // Database
  DB_HOST: ZodEnvString,
  DB_PORT: ZodEnvNumber,
  DB_USER_API: ZodEnvString,
  DB_USER_API_PASS: ZodEnvString,
  DB_DATABASE: ZodEnvString,

  // Keycloak
  KEYCLOAK_HOST: ZodEnvString,
  KEYCLOAK_REALM: ZodEnvString,
  KEYCLOAK_ADMIN_USERNAME: ZodEnvString,
  KEYCLOAK_ADMIN_PASSWORD: ZodEnvString,
  KEYCLOAK_API_TOKEN_URL: ZodEnvString,
  KEYCLOAK_API_CLIENT_ID: ZodEnvString,
  KEYCLOAK_API_CLIENT_SECRET: ZodEnvString,
  KEYCLOAK_API_HOST: ZodEnvString,
  KEYCLOAK_API_ENVIRONMENT: ZodEnvString,

  // Logging
  LOG_LEVEL: z.enum(['silent', 'error', 'warn', 'info', 'debug', 'silly']),
  LOG_LEVEL_FILE: z.enum(['silent', 'error', 'warn', 'info', 'debug', 'silly']),
  LOG_FILE_DIR: ZodEnvString,
  LOG_FILE_NAME: ZodEnvString,
  LOG_FILE_DATE_PATTERN: ZodEnvString,
  LOG_FILE_MAX_SIZE: ZodEnvString,
  LOG_FILE_MAX_FILES: ZodEnvString,

  // Validation
  API_RESPONSE_VALIDATION_ENABLED: z.enum(['true', 'false']),
  DATABASE_RESPONSE_VALIDATION_ENABLED: z.enum(['true', 'false']),

  // File upload limits
  MAX_REQ_BODY_SIZE: ZodEnvNumber,
  MAX_UPLOAD_NUM_FILES: ZodEnvNumber,
  MAX_UPLOAD_FILE_SIZE: ZodEnvNumber,

  // External Services
  CB_API_HOST: ZodEnvString,
  APP_HOST: ZodEnvString,
  LOTEK_API_HOST: ZodEnvString,
  LOTEK_ACCOUNT_USERNAME: ZodEnvString,
  LOTEK_ACCOUNT_PASSWORD: ZodEnvString,
  VECTRONIC_API_HOST: ZodEnvString,

  // Biohub
  BACKBONE_INTERNAL_API_HOST: ZodEnvString,
  BACKBONE_INTAKE_PATH: ZodEnvString,
  BIOHUB_TAXON_PATH: ZodEnvString,
  BIOHUB_TAXON_TSN_PATH: ZodEnvString,

  // Object Store
  OBJECT_STORE_URL: ZodEnvString,
  OBJECT_STORE_ACCESS_KEY_ID: ZodEnvString,
  OBJECT_STORE_SECRET_KEY_ID: ZodEnvString,
  OBJECT_STORE_BUCKET_NAME: ZodEnvString,
  S3_KEY_PREFIX: ZodEnvString,

  // GCNotify
  GCNOTIFY_SECRET_API_KEY: ZodEnvString,
  GCNOTIFY_ADMIN_EMAIL: ZodEnvString,
  GCNOTIFY_ONBOARDING_REQUEST_EMAIL_TEMPLATE: z.string().uuid(),
  GCNOTIFY_ONBOARDING_REQUEST_SMS_TEMPLATE: z.string().uuid(),
  GCNOTIFY_REQUEST_RESUBMIT_TEMPLATE: z.string().uuid(),
  GCNOTIFY_EMAIL_URL: ZodEnvString,
  GCNOTIFY_SMS_URL: ZodEnvString,

  // ClamAV
  CLAMAV_PORT: ZodEnvNumber,
  CLAMAV_HOST: ZodEnvString,
  ENABLE_FILE_VIRUS_SCAN: z.enum(['true', 'false']),

  // Extra
  FEATURE_FLAGS: z.string().trim().optional() // flagA,flagB,flagC
});

type Env = z.infer<typeof EnvSchema>;

/**
 * Load Environment Variables and validate them against the Zod schema.
 *
 * @returns {*} {Env} Validated environment variables
 */
export const loadEnvironmentVariables = (): Env => {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    defaultLog.error({
      label: 'loadEnvironmentVariables',
      message: 'Environment variables validation check failed',
      errors: parsed.error.flatten().fieldErrors
    });

    process.exit(1);
  }

  return parsed.data;
};

/**
 * Get an environment variable by name.
 *
 * Tests can mock this function to return a specific value to prevent direct access to process.env.
 *
 * @template EnvKey
 * @param {EnvKey} envVariable The environment variable to get
 * @returns {*} {Env[EnvKey]} The environment variable value
 */
export const getEnvironmentVariable = <EnvKey extends keyof Env>(envVariable: EnvKey): Env[EnvKey] => {
  return process.env[envVariable] as Env[EnvKey];
};

// Extend NodeJS ProcessEnv to include the EnvSchema
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
