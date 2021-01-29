import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_USER = process.env.DB_USER;

/**
 * Insert system_user rows for each member of the development team.
 * This seed will only be necessary while there is no in-app functionality to manage users.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA};

    ${getInsertSystemUserSQL('aagahche', 'IDIR')}
    ${getInsertSystemUserSQL('cgarrettjones', 'IDIR')}
    ${getInsertSystemUserSQL('istest1', 'IDIR')}
    ${getInsertSystemUserSQL('jrpopkin', 'IDIR')}
    ${getInsertSystemUserSQL('jxdunsdo', 'IDIR')}
    ${getInsertSystemUserSQL('mbaerg', 'IDIR')}
    ${getInsertSystemUserSQL('nphura', 'IDIR')}
    ${getInsertSystemUserSQL('opieross', 'IDIR')}
    ${getInsertSystemUserSQL('postman', 'IDIR')}
    ${getInsertSystemUserSQL('robmunro', 'IDIR')}
    ${getInsertSystemUserSQL('rstens', 'IDIR')}
    ${getInsertSystemUserSQL('tadekens', 'IDIR')}
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
    (SELECT id from system_user where user_identifier = '${DB_USER}')
  FROM
    user_identity_source
  WHERE
    name = '${userType}'
  AND
    record_end_date is null;
`;
