import { z } from 'zod';
import { getLogger } from './logger';

const defaultLog = getLogger('src/utils/env-config.ts');

// Custom Zod string type for environment variables ie: '' or ' ' are invalid
const ZodEnvString = z.string().trim().min(1, { message: 'Required' });

// Schema for environment configuration
export const EnvSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NODE_OPTIONS: ZodEnvString,
  TZ: z.literal('America/Vancouver'),

  // API server
  API_HOST: ZodEnvString,
  API_PORT: z.coerce.number(),

  // Database
  DB_HOST: ZodEnvString,
  DB_PORT: z.coerce.number(),
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
  MAX_REQ_BODY_SIZE: z.coerce.number(),
  MAX_UPLOAD_NUM_FILES: z.coerce.number(),
  MAX_UPLOAD_FILE_SIZE: z.coerce.number(),

  // External Services
  CB_API_HOST: ZodEnvString,
  APP_HOST: ZodEnvString,

  // Biohub
  BACKBONE_INTERNAL_API_HOST: ZodEnvString,
  BACKBONE_PUBLIC_API_HOST: ZodEnvString,
  BACKBONE_INTAKE_PATH: ZodEnvString,
  BACKBONE_ARTIFACT_INTAKE_PATH: ZodEnvString,
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
  CLAMAV_PORT: z.coerce.number(),
  CLAMAV_HOST: ZodEnvString,
  ENABLE_FILE_VIRUS_SCAN: z.enum(['true', 'false']),

  // Extra
  FEATURE_FLAGS: ZodEnvString.optional() // flagA,flagB,flagC
});

type Env = z.infer<typeof EnvSchema>;

/**
 * Load Environment Variables and validate them against the Zod schema.
 *
 * @returns {*} {Env} Validated environment variables
 */
export const loadEvironmentVariables = (): Env => {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    defaultLog.error({
      label: 'loadENV',
      message: 'Invalid environment configuration',
      errors: parsed.error.flatten().fieldErrors
    });

    process.exit(1);
  }

  return parsed.data;
};

// Extend NodeJS ProcessEnv to include the EnvSchema
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
