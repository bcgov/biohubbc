export enum ROLE {
  SYSADMIN = 'sysadmin',
  ADMIN = 'admin',
  WRITE = 'write',
  READ = 'read'
}

export const READ_ROLES = [ROLE.SYSADMIN, ROLE.ADMIN, ROLE.WRITE, ROLE.READ];

export const WRITE_ROLES = [ROLE.SYSADMIN, ROLE.ADMIN, ROLE.WRITE];

export const ADMIN_ROLES = [ROLE.SYSADMIN, ROLE.ADMIN];
