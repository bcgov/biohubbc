/**
 * System level roles
 *
 * @export
 * @enum {number}
 */
export enum SYSTEM_ROLE {
  SYSTEM_ADMIN = 'System Administrator',
  PROJECT_ADMIN = 'Project Administrator'
}

/**
 * Used when adding/updating an object in S3 storage to mark the object as requiring authentication.
 *
 * Note: All objects in S3 should be marked as requiring authentication, as all access to the objects should be
 * governed/proxied by the BioHub API.
 *
 * @export
 * @enum {number}
 */
export enum S3_ROLE {
  AUTH_READ = 'authenticated-read'
}
