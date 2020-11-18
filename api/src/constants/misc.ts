// Super user role
const ROLE_SUPER_USER = 'SUP';
// Admin role
const ROLE_ADMIN = 'ADM';
// Data editor role
const ROLE_DATA_EDITOR = 'DAE';
// View only role
const ROLE_DATA_VIEWER = 'DAV';

// Array of all supported roles
export const ALL_ROLES = [ROLE_SUPER_USER, ROLE_ADMIN, ROLE_DATA_EDITOR, ROLE_DATA_VIEWER];

// Array of all roles with read and write capabilities
export const WRITE_ROLES = [ROLE_SUPER_USER, ROLE_ADMIN, ROLE_DATA_EDITOR];

/**
 * Caching keys, for use with `memory-cache`.
 *
 * @export
 * @enum {number}
 */
export enum CacheKeys {
  ALL_CODE_CATEGORIES = 'all-code-categories',
  ALL_CODE_HEADERS = 'all-code-headers',
  ALL_CODES = 'all-codes'
}

/**
 * Supported activity types.
 *
 * @export
 * @enum {number}
 */
export enum ActivityType {
  OBSERVATION = 'Observation',
  MONITOR = 'Monitor',
  TREATMENT = 'Treatment'
}

/**
 * Supported activity sub types.
 *
 * @export
 * @enum {number}
 */
export enum ActivitySubType {
  TERRESTRIAL_PLANT = 'Terrestrial Plant',
  AQUATIC_PLANT = 'Aquatic Plant',
  AQUATIC_TERRESTRIAL_PLANT = 'Aquatic Terrestrial Plant',
  TERRESTRIAL_ANIMAL = 'Terrestrial Animal',
  AQUATIC_ANIMAL = 'Aquatic Animal',
  AQUATIC_TERRESTRIAL_ANIMAL = 'Aquatic Terrestrial Animal'
}

/**
 * Some of the S3 ACL roles supported by default.
 *
 * Full list: https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl
 *
 * @export
 * @enum {number}
 */
export enum S3ACLRole {
  AUTH_READ = 'authenticated-read'
}

/**
 * Root custom api-doc.json keys for any `x-...` fields.
 *
 * @export
 * @enum {number}
 */
export enum X_API_DOC_KEYS {
  /**
   * specifies a field whose value is an object containing `x-enum-code...` fields (see `X_ENUM_CODE`)
   */
  X_ENUM_CODE = 'x-enum-code'
}

/**
 * Nested keys in a `x-enum-code` field (see `X_API_DOC_KEYS.X_ENUM_CODE`)
 *
 * @export
 * @enum {number}
 */
export enum X_ENUM_CODE {
  /**
   * The `code_category` name.
   */
  CATEGORY_NAME = 'x-enum-code-category-name',
  /**
   * The `code_header` name.
   */
  HEADER_NAME = 'x-enum-code-header-name',
  /**
   * The `code` column name that holds the unique code value.
   */
  CODE_NAME = 'x-enum-code-name',
  /**
   * The `code` column name that holds the human readable name for the code value.
   */
  CODE_TEXT = 'x-enum-code-text',
  /**
   * The `code` column name that defines the sort order.
   */
  CODE_SORT_ORDER = 'x-enum-code-sort-order'
}

/**
 * The maximum number of records the search endpoint can return.
 *
 * @type {number}
 */
export const SEARCH_LIMIT_MAX = 100;

/**
 * Supported PSQL `ORDER BY` directions.
 *
 * @export
 * @enum {number}
 */
export enum SORT_DIRECTION {
  ASC = 'ASC',
  DESC = 'DESC'
}
