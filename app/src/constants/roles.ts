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
