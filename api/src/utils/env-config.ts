import { z } from 'zod';
import { getLogger } from './logger';

const defaultLog = getLogger('src/utils/env-config.ts');

// Custom Zod string type for environment variables ie: HOST=' ' || HOST='' === 'Required'
const ZodENVString = z.string().trim().min(1, { message: 'Required' });

// Schema for environment configuration
export const ENVSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NODE_OPTIONS: ZodENVString,
  TZ: z.literal('America/Vancouver'),

  // API server
  API_HOST: ZodENVString,
  API_PORT: z.coerce.number(),

  // Database
  DB_HOST: ZodENVString,
  DB_PORT: z.coerce.number(),
  DB_USER_API: ZodENVString,
  DB_USER_API_PASS: ZodENVString,
  DB_DATABASE: ZodENVString,

  // Keycloak
  KEYCLOAK_HOST: ZodENVString,
  KEYCLOAK_REALM: ZodENVString,
  KEYCLOAK_ADMIN_USERNAME: ZodENVString,
  KEYCLOAK_ADMIN_PASSWORD: ZodENVString,
  KEYCLOAK_API_TOKEN_URL: ZodENVString,
  KEYCLOAK_API_CLIENT_ID: ZodENVString,
  KEYCLOAK_API_CLIENT_SECRET: ZodENVString,
  KEYCLOAK_API_HOST: ZodENVString,
  KEYCLOAK_API_ENVIRONMENT: ZodENVString,

  // Logging
  LOG_LEVEL: z.enum(['silent', 'error', 'warn', 'info', 'debug', 'silly']),
  LOG_LEVEL_FILE: z.enum(['silent', 'error', 'warn', 'info', 'debug', 'silly']),
  LOG_FILE_DIR: ZodENVString,
  LOG_FILE_NAME: ZodENVString,
  LOG_FILE_DATE_PATTERN: ZodENVString,
  LOG_FILE_MAX_SIZE: ZodENVString,
  LOG_FILE_MAX_FILES: ZodENVString,

  // Validation
  API_RESPONSE_VALIDATION_ENABLED: z.enum(['true', 'false']),
  DATABASE_RESPONSE_VALIDATION_ENABLED: z.enum(['true', 'false']),

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

  // ClamAV
  CLAMAV_PORT: z.coerce.number(),
  CLAMAV_HOST: ZodENVString,
  ENABLE_FILE_VIRUS_SCAN: z.enum(['true', 'false']),

  // Extra
  FEATURE_FLAGS: ZodENVString // flagA,flagB,flagC
});

type ENVSchema = z.infer<typeof ENVSchema>;

/**
 * Load Environment Variables and validate them against the schema.
 *
 * @returns void
 */
export const loadENV = (): void => {
  const parsed = ENVSchema.safeParse(process.env);

  if (!parsed.success) {
    defaultLog.error({
      label: 'loadENV',
      message: 'Invalid environment configuration',
      errors: parsed.error.flatten().fieldErrors
    });
    process.exit(1);
  }
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends ENVSchema {}
  }
}
