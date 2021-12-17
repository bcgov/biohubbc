import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_ADMIN = process.env.DB_ADMIN;

const systemUsers = [
  { identifier: 'aagahche', type: 'IDIR', roleId: 1 },
  { identifier: 'cgarrett', type: 'IDIR', roleId: 1 },
  { identifier: 'istest1', type: 'IDIR', roleId: 1 },
  { identifier: 'jrpopkin', type: 'IDIR', roleId: 1 },
  { identifier: 'jxdunsdo', type: 'IDIR', roleId: 1 },
  { identifier: 'mbaerg', type: 'IDIR', roleId: 1 },
  { identifier: 'nphura', type: 'IDIR', roleId: 1 },
  { identifier: 'postman', type: 'IDIR', roleId: 2 },
  { identifier: 'robmunro', type: 'IDIR', roleId: 1 },
  { identifier: 'rstens', type: 'IDIR', roleId: 1 },
  { identifier: 'tadekens', type: 'IDIR', roleId: 1 },
  { identifier: 'test1', type: 'BCEID', roleId: 1 },
  { identifier: 'test2', type: 'BCEID', roleId: 1 },
  { identifier: 'test3', type: 'IDIR', roleId: 1 },
  { identifier: 'test4', type: 'IDIR', roleId: 2 },
  { identifier: 'test5', type: 'IDIR', roleId: 2 },
  { identifier: 'test6', type: 'IDIR', roleId: 6 },
  { identifier: 'test7', type: 'IDIR', roleId: 6 },
  { identifier: 'cypress', type: 'IDIR', roleId: 1 },
  { identifier: 'keinarss', type: 'IDIR', roleId: 1 }
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
