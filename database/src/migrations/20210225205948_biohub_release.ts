import * as fs from 'fs';
import { Knex } from 'knex';
import path from 'path';

const DB_USER_API_PASS = process.env.DB_USER_API_PASS;

const DB_RELEASE = 'release.0.34';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const create_spatial_extensions = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'create_spatial_extensions.psql'));

  const biohub_ddl = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'biohub.sql'));
  const populate_user_identity_source = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_user_identity_source.sql')
  );
  const api_set_context = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_set_context.sql'));

  const tr_audit_trigger = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_audit_trigger.sql'));
  const project_audit_triggers = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'project_audit_triggers.sql'));
  const api_get_context_user_id = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_get_context_user_id.sql'));
  const api_get_context_system_user_role_id = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'api_get_context_system_user_role_id.sql')
  );
  const api_user_is_administrator = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_user_is_administrator.sql'));
  const tr_journal_trigger = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_journal_trigger.sql'));
  const project_journal_triggers = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'project_journal_triggers.sql'));
  const tr_project_funding_source = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_project_funding_source.sql'));
  const tr_survey_proprietor = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_survey_proprietor.sql'));
  const tr_project = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_project.sql'));
  const tr_survey = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_survey.sql'));
  const tr_permit = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_permit.sql'));
  const tr_occurrence_submission = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_occurrence_submission.sql'));
  const api_get_system_constant = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_get_system_constant.sql'));
  const api_get_system_metadata_constant = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'api_get_system_metadata_constant.sql')
  );
  const vw_survey_status = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'vw_survey_status.sql'));

  const api_delete_occurrence_submission = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'api_delete_occurrence_submission.sql')
  );
  const api_delete_survey = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_delete_survey.sql'));
  const api_delete_project = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_delete_project.sql'));
  const api_xml_string_replace = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_xml_string_replace.sql'));
  const api_get_eml_data_package = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_get_eml_data_package.sql'));

  const populate_system_constants = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_system_constant.sql'));
  const populate_first_nations = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_first_nations.sql'));
  const populate_climate_change_initiatives = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_climate_change_initiatives.sql')
  );
  const populate_management_action_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_management_action_type.sql')
  );
  const populate_funding_source = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_funding_source.sql'));
  const populate_investment_action_category = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_investment_action_category.sql')
  );
  const populate_project_type = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_project_type.sql'));
  const populate_activity = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_activity.sql'));
  const populate_iucn_classifications = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_iucn_classifications.sql')
  );
  const populate_project_role = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_project_role.sql'));
  const populate_system_role = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_system_role.sql'));
  const populate_administrative_activity_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_administrative_activity_type.sql')
  );
  const populate_administrative_activity_status_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_administrative_activity_status_type.sql')
  );
  const populate_proprietor_type = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_proprietor_type.sql'));

  const populate_submission_status_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_submission_status_type.sql')
  );
  const populate_submission_message_class = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_submission_message_class.sql')
  );
  const populate_submission_message_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_submission_message_type.sql')
  );

  const populate_system_metadata_constant = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_system_metadata_constant.sql')
  );
  const populate_common_survey_methodology = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_common_survey_methodology.sql')
  );
  const populate_template = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_template.sql'));
  const populate_summary_parameter_code = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_summary_parameter_code.sql')
  );
  const populate_summary_submission_message_class = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_summary_submission_message_class.sql')
  );

  const populate_wldtaxonomic_units = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_wldtaxonomic_units.sql')
  );
  const populate_template_methodology_species = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_template_methodology_species.sql')
  );

  const project_dapi_views = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'project_dapi_views.sql'));
  const dapi_custom_views = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'dapi_custom_views.sql'));

  await knex.raw(`
    -- set up spatial extensions
    ${create_spatial_extensions}

    -- Set up biohub schema
    CREATE SCHEMA IF NOT EXISTS biohub;

    -- Grant postgres user full access to biohub schema
    GRANT ALL ON SCHEMA biohub TO postgres;
    -- Set search path for postgres user
    SET search_path = biohub, public;

    -- Set up biohub API schema
    CREATE SCHEMA IF NOT EXISTS biohub_dapi_v1;

    -- Setup biohub_api user
    CREATE USER biohub_api PASSWORD '${DB_USER_API_PASS}';
    ALTER SCHEMA biohub_dapi_v1 OWNER TO biohub_api;
    GRANT USAGE ON SCHEMA biohub TO biohub_api;
    -- Set search path for biohub_api user
    ALTER ROLE biohub_api SET search_path TO biohub, public, biohub_dapi_v1;

    -- Grant postgres user full access to biohub_dapi_v1 schema
    GRANT ALL ON SCHEMA biohub_dapi_v1 TO biohub_api;
    -- Alter default privileges for postgres user to grant access to future biohub_dapi_v1 schema objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA biohub_dapi_v1 GRANT ALL ON TABLES TO biohub_api;

    -- Grant biohub_api user full access to biohub_dapi_v1 schema
    GRANT ALL ON SCHEMA biohub_dapi_v1 TO postgres;
    -- Alter default privileges for biohub_api user to grant access to future biohub_dapi_v1 schema objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA biohub_dapi_v1 GRANT ALL ON TABLES TO postgres;

    -- Alter default privileges for biohub_api user to grant access to future biohub schema objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA biohub, public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO biohub_api;
    ALTER DEFAULT PRIVILEGES IN SCHEMA biohub, public GRANT EXECUTE ON FUNCTIONS TO biohub_api;
    ALTER DEFAULT PRIVILEGES IN SCHEMA biohub, public GRANT USAGE ON TYPES TO biohub_api;
    ALTER DEFAULT PRIVILEGES IN SCHEMA biohub, public GRANT USAGE, SELECT ON SEQUENCES TO biohub_api;

    ${biohub_ddl}
    ${populate_user_identity_source}
    ${api_set_context}
    ${tr_audit_trigger}
    ${project_audit_triggers}
    ${api_get_context_user_id}
    ${api_get_context_system_user_role_id}
    ${api_user_is_administrator}
    ${tr_journal_trigger}
    ${project_journal_triggers}
    ${tr_project_funding_source}
    ${tr_survey_proprietor}
    ${tr_project}
    ${tr_survey}
    ${tr_permit}
    ${tr_occurrence_submission}
    ${api_get_system_constant}
    ${api_get_system_metadata_constant}
    ${vw_survey_status}

    ${api_delete_occurrence_submission}
    ${api_delete_survey}
    ${api_delete_project}
    ${api_xml_string_replace}
    ${api_get_eml_data_package}

    -- populate look up tables
    set search_path = biohub;
    ${populate_system_constants}
    ${populate_first_nations}
    ${populate_climate_change_initiatives}
    ${populate_management_action_type}
    ${populate_funding_source}
    ${populate_investment_action_category}
    ${populate_project_type}
    ${populate_activity}
    ${populate_iucn_classifications}
    ${populate_project_role}
    ${populate_system_role}
    ${populate_administrative_activity_type}
    ${populate_administrative_activity_status_type}
    ${populate_proprietor_type}
    ${populate_submission_status_type}
    ${populate_submission_message_class}
    ${populate_submission_message_type}
    ${populate_system_metadata_constant}
    ${populate_common_survey_methodology}
    ${populate_template}
    ${populate_summary_parameter_code}
    ${populate_summary_submission_message_class}


    -- temporary external interface tables
    ${populate_wldtaxonomic_units}
    ${populate_template_methodology_species}

    -- create the views
    set search_path = biohub_dapi_v1;
    set role biohub_api;
    ${project_dapi_views}
    ${dapi_custom_views}

    set role postgres;
    set search_path = biohub;
    grant execute on function biohub.api_set_context(_system_user_identifier "system_user".user_identifier%type, _user_identity_source_name user_identity_source.name%type) to biohub_api;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP SCHEMA IF EXISTS biohub CASCADE;
    DROP SCHEMA IF EXISTS biohub_dapi_v1 CASCADE;
    DROP USER IF EXISTS biohub_api;
  `);
}
