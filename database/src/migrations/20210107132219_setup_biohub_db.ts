import Knex from 'knex';
import * as fs from 'fs';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;
const DB_USER_API = process.env.DB_USER_API;
const PASSWORD = process.env.DB_PASS;

export async function up(knex: Knex): Promise<void> {
  const biohub_tables = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub.0.3.sql'));
  const biohub_admin_sql = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub_admin.0.3.sql'));
  const biohub_dapi_views = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub_dapi_views.sql'));
  const api_set_context = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'api_set_context.sql'));
  const tr_audit_trigger = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'tr_audit_trigger.sql'));
  const biohub_audit_triggers = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub_audit_triggers.sql'));
  const api_get_context_user_id = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.3', 'api_get_context_user_id.sql')
  );
  const tr_journal_trigger = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'tr_journal_trigger.sql'));
  const biohub_journal_triggers = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.3', 'biohub_journal_triggers.sql')
  );
  const populate_user_identity_source = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.3', 'populate_user_identity_source.sql')
  );

  await knex.raw(`

    REVOKE ALL PRIVILEGES ON SCHEMA public FROM PUBLIC;

    create schema if not exists ${DB_SCHEMA};
    set search_path = ${DB_SCHEMA};
    ${biohub_tables}
    ${biohub_admin_sql}
    ${populate_user_identity_source}

    create schema if not exists ${DB_SCHEMA_DAPI_V1} ;
    create user "${DB_USER_API}" password '${PASSWORD}';
    alter DEFAULT PRIVILEGES in SCHEMA ${DB_SCHEMA_DAPI_V1} grant ALL on tables to "${DB_USER_API}";

    ${biohub_dapi_views}
    ${api_set_context}
    ${tr_audit_trigger}
    ${biohub_audit_triggers}
    ${api_get_context_user_id}
    ${tr_journal_trigger}
    ${biohub_journal_triggers}

    grant usage on schema ${DB_SCHEMA_DAPI_V1} to "${DB_USER_API}";
    grant usage on schema  ${DB_SCHEMA} to "${DB_USER_API}";
    grant all on all tables in schema  ${DB_SCHEMA_DAPI_V1} to "${DB_USER_API}";
    alter DEFAULT PRIVILEGES in SCHEMA ${DB_SCHEMA_DAPI_V1} grant ALL on tables to "${DB_USER_API}";
    alter role "${DB_USER_API}" set search_path to ${DB_SCHEMA_DAPI_V1}, ${DB_SCHEMA};


  `);
}

export async function down(knex: Knex): Promise<void> {
  const db_setup_down = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'db_setup_down.sql'));

  await knex.raw(`

    ${db_setup_down}

  `);
}
