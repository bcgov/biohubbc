import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_ADMIN = process.env.DB_ADMIN;

const systemUsers = [
  { identifier: 'aagahche', type: 'IDIR' },
  { identifier: 'cgarrettjones', type: 'IDIR' },
  { identifier: 'istest1', type: 'IDIR' },
  { identifier: 'jrpopkin', type: 'IDIR' },
  { identifier: 'jxdunsdo', type: 'IDIR' },
  { identifier: 'mbaerg', type: 'IDIR' },
  { identifier: 'nphura', type: 'IDIR' },
  { identifier: 'opieross', type: 'IDIR' },
  { identifier: 'postman', type: 'IDIR' },
  { identifier: 'robmunro', type: 'IDIR' },
  { identifier: 'rstens', type: 'IDIR' },
  { identifier: 'tadekens', type: 'IDIR' }
];

/**
 * Insert system_user rows for each member of the development team.
 * This seed will only be necessary while there is no in-app functionality to manage users.
 */
export async function seed(knex: Knex): Promise<void> {
  // Remove the existing system users. Do not remove the `postgres` user which is required for the triggers to work and
  // which is added as part of the setup migration.
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA};

    DELETE FROM system_user WHERE user_identifier IN (${systemUsers.map((user) => `'${user.identifier}'`).join(',')});
  `);

  // Seed the system users
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA};

    ${systemUsers.map((user) => getInsertSystemUserSQL(user.identifier, user.type)).join(' ')}
  `);
}

const getInsertSystemUserSQL = (userIdentifier: string, userType: string) => `
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
