import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_ADMIN = process.env.DB_ADMIN;

export enum SYSTEM_IDENTITY_SOURCE {
  DATABASE = 'DATABASE',
  IDIR = 'IDIR',
  BCEID = 'BCEID'
}

export enum SYSTEM_USER_ROLE_ID {
  SYSTEM_ADMINISTRATOR = 1,
  CREATOR = 2,
  DATA_ADMINISTRATOR = 3
}

const systemUsers = [
  { identifier: 'aagahche', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'cgarrett', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'cupshall', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'jxdunsdo', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'keinarss', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'mbaerg', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'nphura', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'robmunro', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'rstens', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'zochampi', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'test1', type: SYSTEM_IDENTITY_SOURCE.BCEID, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'test2', type: SYSTEM_IDENTITY_SOURCE.BCEID, roleId: SYSTEM_USER_ROLE_ID.CREATOR },
  { identifier: 'test3', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'test4', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR },
  { identifier: 'test5', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.DATA_ADMINISTRATOR },
  { identifier: 'test6', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.CREATOR },
  { identifier: 'test7', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.CREATOR },
  { identifier: 'cypress', type: SYSTEM_IDENTITY_SOURCE.IDIR, roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR }
];

/**
 * Insert system_user rows for each member of the development team if they don't already exist in the system user table.
 *
 * Note: This seed will only be necessary while there is no in-app functionality to manage users.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA};
  `);

  for (const systemUser of systemUsers) {
    // check if user is already in the system users table
    const response = await knex.raw(`
      ${getSystemUserSQL(systemUser.identifier)}
    `);

    // if the fetch returns no rows, then the user is not in the system users table and should be added
    if (!response?.rows?.[0]) {
      // Add system user
      await knex.raw(`
        ${insertSystemUserSQL(systemUser.identifier, systemUser.type)}
      `);

      // Add system administrator role
      await knex.raw(`
        ${insertSystemUserRoleSQL(systemUser.identifier, systemUser.roleId)}
      `);
    }
  }
}

/**
 * SQL to fetch an existing system user row.
 *
 * @param {string} userIdentifier
 */
const getSystemUserSQL = (userIdentifier: string) => `
  SELECT
    user_identifier
  FROM
    system_user
  WHERE
    user_identifier = '${userIdentifier}';
`;

/**
 * SQL to insert a system user row.
 *
 * @param {string} userIdentifier
 * @param {string} userType
 */
const insertSystemUserSQL = (userIdentifier: string, userType: string) => `
  INSERT INTO system_user (
    user_identity_source_id,
    user_identifier,
    record_effective_date,
    create_date,
    create_user
  )
  SELECT
    user_identity_source_id,
    '${userIdentifier}',
    now(),
    now(),
    (SELECT system_user_id from system_user where user_identifier = '${DB_ADMIN}')
  FROM
    user_identity_source
  WHERE
    name = '${userType}'
  AND
    record_end_date is null;
`;

/**
 * SQL to insert a system user role row.
 *
 * @param {string} userIdentifier
 * @param {number} roleId
 */
const insertSystemUserRoleSQL = (userIdentifier: string, roleId: number) => `
  INSERT INTO system_user_role (
    system_user_id,
    system_role_id
  ) VALUES (
    (SELECT system_user_id from system_user where user_identifier = '${userIdentifier}'),
    ${roleId}
  );
`;
