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

export const getAllSystemRoles = () => Object.values(SYSTEM_ROLE);

/**
 * Project level roles.
 *
 * @export
 * @enum {number}
 */
export enum PROJECT_ROLE {
  PROJECT_LEAD = 'Project Lead',
  PROJECT_EDITOR = 'Editor',
  PROJECT_VIEWER = 'Viewer'
}
