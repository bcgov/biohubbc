import { mdiAccountEdit, mdiEye, mdiStar } from '@mdi/js';

/**
 * System level roles.
 *
 * @export
 * @enum {number}
 */
export enum SYSTEM_ROLE {
  SYSTEM_ADMIN = 'System Administrator',
  PROJECT_CREATOR = 'Creator',
  DATA_ADMINISTRATOR = 'Data Administrator'
}

/**
 * Project level roles.
 *
 * @export
 * @enum {string}
 */
export enum SURVEY_ROLE {
  COORDINATOR = 'Coordinator',
  COLLABORATOR = 'Collaborator'
}

/**
 * Role permissions.
 *
 * @export
 * @enum {string}
 */
export enum SURVEY_PERMISSION {
  COORDINATOR = 'Coordinator',
  COLLABORATOR = 'Collaborator',
  OBSERVER = 'Observer'
}

/**
 * Project role icons
 *
 * @export
 */
export const SURVEY_ROLE_ICONS: Record<string, string> = {
  Coordinator: mdiStar,
  Collaborator: mdiAccountEdit,
  Observer: mdiEye
};

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
