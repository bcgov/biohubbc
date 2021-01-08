import Knex from 'knex';
import * as fs from 'fs';

const DB_SCHEMA = 'biohub';
const path = require('path');

export async function up(knex: Knex): Promise<void> {
    //const filePath = path.join(__dirname, '..', 'release.0.3', 'biohub.0.3.sql')
    const biohub_tables = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub.0.3.sql'));
    const biohub_admin_sql = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub_admin.0.3.sql'));
    const biohub_dapi_views = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub_dapi_views.sql'));
    const api_set_context = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'api_set_context.sql'));
    const tr_audit_trigger = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'tr_audit_trigger.sql'));
    const biohub_audit_triggers = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub_audit_triggers.sql'));
    const api_get_context_user_id = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'api_get_context_user_id'));
    const tr_journal_trigger = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'tr_journal_trigger.sql'));
    const biohub_journal_triggers = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'biohub_journal_triggers.sql'));
  
  
  await knex.raw(`

    REVOKE ALL PRIVILEGES ON SCHEMA public FROM PUBLIC;

    create schema if not exists biohub;
    set search_path = biohub;
    ${biohub_tables}
    ${biohub_admin_sql}
  
    create schema if not exists biohub_dapi_v1;
  
    create user biohub_api password 'flatpass';
  
    alter DEFAULT PRIVILEGES in SCHEMA biohub_dapi_v1 grant ALL on tables to biohub_api;
    ${biohub_dapi_views}
    ${api_set_context}
    ${tr_audit_trigger}
    ${biohub_audit_triggers}
    ${api_get_context_user_id}
    ${tr_journal_trigger}
    ${biohub_journal_triggers}
  
    grant usage on schema biohub_dapi_v1 to biohub_api;
    grant usage on schema biohub to biohub_api;
    grant all on all tables in schema biohub_dapi_v1 to biohub_api;
    alter DEFAULT PRIVILEGES in SCHEMA biohub_dapi_v1 grant ALL on tables to biohub_api;
  
    alter role biohub_api set search_path to biohub_dapi_v1, biohub;
  
  `);
}

export async function down(knex: Knex): Promise<void> {
  const db_setup_down = fs.readFileSync(path.join(__dirname, '..', 'release.0.3', 'db_setup_down.sql'));
  
  await knex.raw(`
    ${db_setup_down}
    
  `);
}
