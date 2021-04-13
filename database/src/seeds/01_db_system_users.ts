import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_ADMIN = process.env.DB_ADMIN;

const systemUsers = [
  { identifier: 'aagahche', type: 'IDIR' },
  { identifier: 'cgarrett', type: 'IDIR' },
  { identifier: 'istest1', type: 'IDIR' },
  { identifier: 'jrpopkin', type: 'IDIR' },
  { identifier: 'jxdunsdo', type: 'IDIR' },
  { identifier: 'mbaerg', type: 'IDIR' },
  { identifier: 'nphura', type: 'IDIR' },
  { identifier: 'opieross', type: 'IDIR' },
  { identifier: 'postman', type: 'IDIR' },
  { identifier: 'robmunro', type: 'IDIR' },
  { identifier: 'rstens', type: 'IDIR' },
  { identifier: 'tadekens', type: 'IDIR' },
  { identifier: 'sdevalap', type: 'IDIR' }
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
      await knex.raw(`
        ${insertSystemUserSQL(systemUser.identifier, systemUser.type)}
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
    uis_id,
    user_identifier,
    record_effective_date,
    create_date,
    create_user
  )
  SELECT
    id,
    '${userIdentifier}',
    now(),
    now(),
    (SELECT id from system_user where user_identifier = '${DB_ADMIN}')
  FROM
    user_identity_source
  WHERE
    name = '${userType}'
  AND
    record_end_date is null;
`;
