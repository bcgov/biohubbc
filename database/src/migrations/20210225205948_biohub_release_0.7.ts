import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const DB_USER_API_PASS = process.env.DB_USER_API_PASS;
const DB_USER_API = process.env.DB_USER_API;

/**
 * Apply biohub release 0.7 changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const create_spatial_extensions = fs.readFileSync(
    path.join(__dirname, 'release.0.7', 'create_spatial_extensions.psql')
  );
  const biohub_0_7 = fs.readFileSync(path.join(__dirname, 'release.0.7', 'biohub.0.7.sql'));
  const populate_user_identity_source = fs.readFileSync(
    path.join(__dirname, 'release.0.7', 'populate_user_identity_source.sql')
  );
  const api_set_context = fs.readFileSync(path.join(__dirname, 'release.0.7', 'api_set_context.sql'));
  const tr_audit_trigger = fs.readFileSync(path.join(__dirname, 'release.0.7', 'tr_audit_trigger.sql'));
  const project_audit_triggers = fs.readFileSync(path.join(__dirname, 'release.0.7', 'project_audit_triggers.sql'));
  const api_get_context_user_id = fs.readFileSync(path.join(__dirname, 'release.0.7', 'api_get_context_user_id.sql'));
  const tr_journal_trigger = fs.readFileSync(path.join(__dirname, 'release.0.7', 'tr_journal_trigger.sql'));
  const project_journal_triggers = fs.readFileSync(path.join(__dirname, 'release.0.7', 'project_journal_triggers.sql'));
  const tr_project_funding_source = fs.readFileSync(
    path.join(__dirname, 'release.0.7', 'tr_project_funding_source.sql')
  );

  const populate_first_nations = fs.readFileSync(path.join(__dirname, 'release.0.7', 'populate_first_nations.sql'));
  const populate_climate_change_initiatives = fs.readFileSync(
    path.join(__dirname, 'release.0.7', 'populate_climate_change_initiatives.sql')
  );
  const populate_management_action_type = fs.readFileSync(
    path.join(__dirname, 'release.0.7', 'populate_management_action_type.sql')
  );
  const populate_funding_source = fs.readFileSync(path.join(__dirname, 'release.0.7', 'populate_funding_source.sql'));
  const populate_investment_action_category = fs.readFileSync(
    path.join(__dirname, 'release.0.7', 'populate_investment_action_category.sql')
  );
  const populate_project_type = fs.readFileSync(path.join(__dirname, 'release.0.7', 'populate_project_type.sql'));
  const populate_activity = fs.readFileSync(path.join(__dirname, 'release.0.7', 'populate_activity.sql'));
  const populate_icun_classifications = fs.readFileSync(
    path.join(__dirname, 'release.0.7', 'populate_icun_classifications.sql')
  );

  const project_dapi_views = fs.readFileSync(path.join(__dirname, 'release.0.7', 'project_dapi_views.sql'));

  await knex.raw(`
    -- set up spatial extensions
    ${create_spatial_extensions}

    -- set up biohub schema
    create schema if not exists biohub;
    set search_path = biohub, public;

    ${biohub_0_7}
    ${populate_user_identity_source}
    ${api_set_context}
    ${tr_audit_trigger}
    ${project_audit_triggers}
    ${api_get_context_user_id}
    ${tr_journal_trigger}
    ${project_journal_triggers}
    ${tr_project_funding_source}

    -- populate look up tables
    set search_path = biohub;
    ${populate_first_nations}
    ${populate_climate_change_initiatives}
    ${populate_management_action_type}
    ${populate_funding_source}
    ${populate_investment_action_category}
    ${populate_project_type}
    ${populate_activity}
    ${populate_icun_classifications}

    -- setup biohub api schema
    create schema if not exists biohub_dapi_v1;
    set search_path = biohub_dapi_v1;
    ${project_dapi_views}

    -- setup api user
    create user ${DB_USER_API} password '${DB_USER_API_PASS}';
    grant usage on schema biohub_dapi_v1 to ${DB_USER_API};
    grant usage on schema biohub to ${DB_USER_API};
    grant all on all tables in schema biohub_dapi_v1 to ${DB_USER_API};
    alter DEFAULT PRIVILEGES in SCHEMA biohub_dapi_v1 grant ALL on tables to ${DB_USER_API};
    --grant postgis_reader to ${DB_USER_API};
    alter role ${DB_USER_API} set search_path to biohub_dapi_v1, biohub, public, topology;

    set search_path = biohub;
    grant execute on function api_set_context(idir_user_id system_user.user_identifier%type, bceid_user_id system_user.user_identifier%type) to ${DB_USER_API};

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
