import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_ADMIN = process.env.DB_ADMIN;

export enum SYSTEM_IDENTITY_SOURCE {
  DATABASE = 'DATABASE',
  IDIR = 'IDIR',
  BCEID_BASIC = 'BCEIDBASIC',
  BCEID_BUSINESS = 'BCEIDBUSINESS'
}

export enum SYSTEM_USER_ROLE_ID {
  SYSTEM_ADMINISTRATOR = 1,
  CREATOR = 2,
  DATA_ADMINISTRATOR = 6
}

const systemUsers = [
  {
    identifier: 'arosenth',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: 'DFE2CC5E345E4B1E813EC1DC10852064'
  },
  {
    identifier: 'aagahche',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: 'DF86C48FAD244498B0881AF8DBB7645F'
  },

  {
    identifier: 'cgarrett',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: '067361FFF3514B5E80AAAAD795E6741D'
  },
  {
    identifier: 'cupshall',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: 'C42DFA74A976490A819BC85FF5E254E4'
  },
  {
    identifier: 'jxdunsdo',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: '82E8D3B4BAD045E8AD3980D426EA781C'
  },
  {
    identifier: 'keinarss',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: 'F4663727DE89489C8B7CFA81E4FA99B3'
  },
  {
    identifier: 'nphura',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: '813B096BC1BC4AAAB2E39DDE58F432E2'
  },
  {
    identifier: 'robmunro',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: '72013F74B95A4FBEB53BDB4B494E5550'
  },
  {
    identifier: 'zochampi',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: '349F20767A834FB582A18E8D378973E7'
  },
  {
    identifier: 'achirico',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    roleId: SYSTEM_USER_ROLE_ID.SYSTEM_ADMINISTRATOR,
    user_guid: 'E3A279530D164485BF43C6FE7A49E175'
  }
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
        ${insertSystemUserSQL(systemUser.identifier, systemUser.type, systemUser.user_guid.toLowerCase())}
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
const insertSystemUserSQL = (userIdentifier: string, userType: string, userGuid: string) => `
  INSERT INTO system_user (
    user_identity_source_id,
    user_identifier,
    user_guid,
    record_effective_date,
    create_date,
    create_user
  )
  SELECT
    user_identity_source_id,
    '${userIdentifier}',
    '${userGuid.toLowerCase()}',
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
