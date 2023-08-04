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
 * @enum {string}
 */
export enum PROJECT_ROLE {
  COORDINATOR = 'Coordinator',
  COLLABORATOR = 'Collaborator',
  OBSERVER = 'Observer'
}

/**
 * Role permissions.
 *
 * @export
 * @enum {string}
 */
export enum PROJECT_PERMISSION {
  COORDINATOR = 'Coordinator',
  COLLABORATOR = 'Collaborator',
  OBSERVER = 'Observer'
}
