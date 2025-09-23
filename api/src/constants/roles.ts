/**
 * System level roles.
 *
 * @export
 * @enum {string}
 */
export enum SYSTEM_ROLE {
  SYSTEM_ADMIN = 'System Administrator',
  PROJECT_CREATOR = 'Creator',
  DATA_ADMINISTRATOR = 'Data Administrator'
}

/**
 * Survey level roles.
 *
 * @export
 * @enum {string}
 */
export enum SURVEY_ROLE {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
  VIEWER = 'Viewer'
}

/**
 * Collection level roles.
 *
 * @export
 * @enum {string}
 */
export enum COLLECTION_ROLE {
  ADMIN = 'Admin',
  MEMBER = 'Member'
}
