import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_ADMIN = process.env.DB_ADMIN;

enum SYSTEM_IDENTITY_SOURCE {
  DATABASE = 'DATABASE',
  IDIR = 'IDIR',
  BCEID_BASIC = 'BCEIDBASIC',
  BCEID_BUSINESS = 'BCEIDBUSINESS',
  UNVERIFIED = 'UNVERIFIED'
}

enum SYSTEM_USER_ROLE_NAME {
  SYSTEM_ADMINISTRATOR = 'System Administrator',
  CREATOR = 'Creator',
  DATA_ADMINISTRATOR = 'Data Administrator'
}

interface SystemUserSeed {
  identifier: string;
  type: SYSTEM_IDENTITY_SOURCE;
  role_name: SYSTEM_USER_ROLE_NAME;
  user_guid: string;
  display_name: string;
  given_name: string;
  family_name: string;
  email: string;
}

const systemUsers: SystemUserSeed[] = [
  {
    identifier: 'arosenth',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: 'DFE2CC5E345E4B1E813EC1DC10852064',
    display_name: 'XT:Rosenthal, Alfred WLRS:IN',
    given_name: 'Alfred',
    family_name: 'Rosenthal',
    email: 'alfred.rosenthal@quartech.com'
  },
  {
    identifier: 'cupshall',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: 'C42DFA74A976490A819BC85FF5E254E4',
    display_name: 'Upshall, Curtis WLRS:EX',
    given_name: 'Curtis',
    family_name: 'Upshall',
    email: 'curtis.upshall@gov.bc.ca'
  },
  {
    identifier: 'jxdunsdo',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: '82E8D3B4BAD045E8AD3980D426EA781C',
    display_name: 'Dunsdon, Jeremy X WLRS:EX',
    given_name: 'Jeremy',
    family_name: 'Dunsdon',
    email: 'jeremy.x.dunsdon@gov.bc.ca'
  },
  {
    identifier: 'keinarss',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: 'F4663727DE89489C8B7CFA81E4FA99B3',
    display_name: 'Einarsson, Kjartan WLRS:EX',
    given_name: 'Kjartan',
    family_name: 'Einarsson',
    email: 'kjartan.einarsson@gov.bc.ca'
  },
  {
    identifier: 'nphura',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: '813B096BC1BC4AAAB2E39DDE58F432E2',
    display_name: 'Phura, Nick WLRS:EX',
    given_name: 'Nick',
    family_name: 'Phura',
    email: 'nick.phura@gov.bc.ca'
  },
  {
    identifier: 'zochampi',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: '349F20767A834FB582A18E8D378973E7',
    display_name: 'Champiri, Zohreh D WLRS:EX',
    given_name: 'Zohreh',
    family_name: 'Champiri',
    email: 'zohreh.d.champiri@gov.bc.ca'
  },
  {
    identifier: 'achirico',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: 'E3A279530D164485BF43C6FE7A49E175',
    display_name: 'Chirico, Albert WLRS:EX',
    given_name: 'Albert',
    family_name: 'Chirico',
    email: 'albert.chirico@gov.bc.ca'
  },
  {
    identifier: 'mdeluca',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: '0054CF4823A744309BE399C34B6B0F43',
    display_name: 'Deluca, Mac WLRS:EX',
    given_name: 'Mac',
    family_name: 'Deluca',
    email: 'mac.deluca@gov.bc.ca'
  },
  {
    identifier: 'gstewart',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: '83245BCDC21F43A29CEDA78AE67DF223',
    display_name: 'Stewart, Graham WLRS:EX',
    given_name: 'Stewart',
    family_name: 'Graham',
    email: 'graham.stewart@gov.bc.ca'
  },
  {
    identifier: 'jkissack',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: 'A82FE250A5BC40E68ABC54A1D0618D75',
    display_name: 'Kissack, Jeremy WLRS:EX',
    given_name: 'Jeremy',
    family_name: 'Kissack',
    email: 'jeremy.kissack@gov.bc.ca'
  },
  {
    identifier: 'mauberti',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: '62EC624E50844486A046DC9709854F8D',
    display_name: 'Aubertin-Young, Macgregor WLRS:EX',
    given_name: 'Macgregor',
    family_name: 'Aubertin-Young',
    email: 'macgregor.aubertin-young@gov.bc.ca'
  },
  {
    identifier: 'anthomps',
    type: SYSTEM_IDENTITY_SOURCE.IDIR,
    role_name: SYSTEM_USER_ROLE_NAME.SYSTEM_ADMINISTRATOR,
    user_guid: '543C3CE2F4DE472DB3A569FD0024B244',
    display_name: 'Thompson, Andrew WLRS:EX',
    given_name: 'Andrew',
    family_name: 'Thompson',
    email: 'andrew.thompson@gov.bc.ca'
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
      ${getSystemUserSQL(systemUser)}
    `);

    // if the fetch returns no rows, then the user is not in the system users table and should be added
    if (!response?.rows?.[0]) {
      // Add system user
      await knex.raw(`
        ${insertSystemUserSQL(systemUser)}
      `);

      // Add system administrator role
      await knex.raw(`
        ${insertSystemUserRoleSQL(systemUser)}
      `);
    }
  }
}

/**
 * SQL to fetch an existing system user row.
 *
 * @param {SystemUserSeed} systemUser
 */
const getSystemUserSQL = (systemUser: SystemUserSeed) => `
  SELECT
    user_identifier
  FROM
    system_user
  WHERE
    LOWER(user_identifier) = LOWER('${systemUser.identifier}');
`;

/**
 * SQL to insert a system user row.
 *
 * @param {SystemUserSeed} systemUser
 */
const insertSystemUserSQL = (systemUser: SystemUserSeed) => `
  INSERT INTO system_user (
    user_identity_source_id,
    user_identifier,
    user_guid,
    record_effective_date,
    create_date,
    create_user,
    display_name,
    given_name,
    family_name,
    email
  )
  SELECT
    user_identity_source_id,
    '${systemUser.identifier}',
    LOWER('${systemUser.user_guid}'),
    now(),
    now(),
    (SELECT system_user_id from system_user where LOWER(user_identifier) = LOWER('${DB_ADMIN}')),
    '${systemUser.display_name}',
    '${systemUser.given_name}',
    '${systemUser.family_name}',
    '${systemUser.email}'
  FROM
    user_identity_source
  WHERE
    LOWER(name) = LOWER('${systemUser.type}')
  AND
    record_end_date is null;
`;

/**
 * SQL to insert a system user role row.
 *
 * @param {SystemUserSeed} systemUser
 */
const insertSystemUserRoleSQL = (systemUser: SystemUserSeed) => `
  INSERT INTO system_user_role (
    system_user_id,
    system_role_id
  ) VALUES (
    (SELECT system_user_id from system_user where LOWER(user_identifier) = LOWER('${systemUser.identifier}')),
    (SELECT system_role_id from system_role where LOWER(name) = LOWER('${systemUser.role_name}'))
  );
`;
