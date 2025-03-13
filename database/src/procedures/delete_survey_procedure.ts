import { Knex } from 'knex';

/**
 * Inserts a procedure that makes all of the necessary deletions when a survey is deleted (deleting all child records
 * before deleting the survey record itself).
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    CREATE OR REPLACE PROCEDURE
      biohub.api_delete_survey(p_survey_id integer)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $procedure$

      declare

      BEGIN

        -------- delete basic survey data --------

        WITH
          occurrence_submissions AS
        (
          SELECT occurrence_submission_id
          FROM occurrence_submission
          WHERE survey_id = p_survey_id
        ),
          submission_spatial_components AS
        (
          SELECT submission_spatial_component_id
          FROM submission_spatial_component
          WHERE occurrence_submission_id IN (
            SELECT occurrence_submission_id
            FROM occurrence_submissions
          )
        )

        DELETE FROM spatial_transform_submission
        WHERE submission_spatial_component_id IN (
          SELECT submission_spatial_component_id FROM submission_spatial_components
        );

        DELETE FROM submission_spatial_component
        WHERE occurrence_submission_id IN (
          SELECT occurrence_submission_id FROM occurrence_submission WHERE survey_id = p_survey_id
        );

        WITH
          occurrence_submissions AS (
            SELECT occurrence_submission_id FROM occurrence_submission WHERE survey_id = p_survey_id
          ), submission_statuses AS (
            SELECT submission_status_id FROM submission_status WHERE occurrence_submission_id IN (
              SELECT occurrence_submission_id FROM occurrence_submissions
            )
          )

        DELETE FROM submission_message
        WHERE submission_status_id IN (
          SELECT submission_status_id FROM submission_statuses
        );

        DELETE FROM submission_status
        WHERE occurrence_submission_id IN (
          SELECT occurrence_submission_id FROM occurrence_submission WHERE survey_id = p_survey_id
        );

        DELETE FROM occurrence_submission_publish
        WHERE occurrence_submission_id IN (
          SELECT occurrence_submission_id FROM occurrence_submission WHERE survey_id = p_survey_id
        );

        DELETE FROM occurrence_submission
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_summary_submission_publish
        WHERE survey_summary_submission_id IN (
          SELECT survey_summary_submission_id FROM survey_summary_submission WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_summary_submission_message
        WHERE survey_summary_submission_id IN (
          SELECT survey_summary_submission_id FROM survey_summary_submission WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_summary_submission
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_proprietor
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_attachment_publish
        WHERE survey_attachment_id IN (
          SELECT survey_attachment_id FROM survey_attachment WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_attachment
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_report_author
        WHERE survey_report_attachment_id IN (
          SELECT survey_report_attachment_id FROM survey_report_attachment WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_report_publish
        WHERE survey_report_attachment_id IN (
          SELECT survey_report_attachment_id FROM survey_report_attachment WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_report_attachment
        WHERE survey_id = p_survey_id;

        DELETE FROM study_species_unit
        WHERE study_species_unit_id IN (
            SELECT study_species_unit_id FROM study_species WHERE survey_id = p_survey_id
        );

        DELETE FROM study_species
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_funding_source
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_spatial_component
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_metadata_publish
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_region
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_first_nation_partnership
        WHERE survey_id = p_survey_id;

        DELETE FROM permit
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_type
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_first_nation_partnership
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_stakeholder_partnership
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_participation
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_site_strategy
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_location
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_intended_outcome
        WHERE survey_id = p_survey_id;

        -------- delete device, deployment, credential, telemetry data --------

        DELETE FROM telemetry_manual
        WHERE deployment_id IN (SELECT deployment_id FROM deployment WHERE survey_id = p_survey_id);

        DELETE FROM survey_telemetry_vendor_credential
        WHERE survey_telemetry_credential_attachment_id IN (SELECT survey_telemetry_credential_attachment_id from survey_telemetry_credential_attachment WHERE survey_id = p_survey_id);

        DELETE FROM survey_telemetry_credential_attachment
        WHERE survey_id = p_survey_id;

        DELETE FROM deployment
        WHERE critter_id IN (SELECT critter_id FROM critter WHERE survey_id = p_survey_id);

        DELETE FROM deployment
        WHERE survey_id = p_survey_id;

        DELETE FROM device
        WHERE survey_id = p_survey_id;

        -------- delete animal data --------

        DELETE FROM subcount_critter
        WHERE critter_id IN (SELECT critter_id FROM critter WHERE survey_id = p_survey_id);

        DELETE FROM critter_mortality_attachment
        WHERE critter_id IN (SELECT critter_id FROM critter WHERE survey_id = p_survey_id);

        DELETE FROM critter_capture_attachment
        WHERE critter_id IN (SELECT critter_id FROM critter WHERE survey_id = p_survey_id);

        DELETE FROM critter
        WHERE survey_id = p_survey_id;

        -------- delete observation data --------

        DELETE FROM observation_subcount_qualitative_measurement
        WHERE observation_subcount_id IN (
          SELECT observation_subcount_id FROM observation_subcount
          WHERE survey_observation_id IN (
            SELECT survey_observation_id FROM survey_observation
            WHERE survey_id = p_survey_id
          )
        );

        DELETE FROM observation_subcount_quantitative_measurement
        WHERE observation_subcount_id IN (
          SELECT observation_subcount_id FROM observation_subcount
          WHERE survey_observation_id IN (
            SELECT survey_observation_id FROM survey_observation
            WHERE survey_id = p_survey_id
          )
        );

        DELETE FROM observation_subcount
        WHERE survey_observation_id IN (
          SELECT survey_observation_id FROM survey_observation
          WHERE survey_id = p_survey_id
        );

        DELETE FROM observation_environment_qualitative
        WHERE survey_observation_id IN (
          SELECT survey_observation_id FROM survey_observation
          WHERE survey_id = p_survey_id
        );

        DELETE FROM observation_environment_quantitative
        WHERE survey_observation_id IN (
          SELECT survey_observation_id FROM survey_observation
          WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_observation
        WHERE survey_id = p_survey_id;

        -------- delete habitat feature data --------

        DELETE FROM survey_habitat_feature_qualitative
        WHERE survey_habitat_feature_id IN (
          SELECT survey_habitat_feature_id FROM survey_habitat_feature
          WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_habitat_feature_quantitative
        WHERE survey_habitat_feature_id IN (
          SELECT survey_habitat_feature_id FROM survey_habitat_feature
          WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_habitat_feature
        WHERE survey_id = p_survey_id;

        -------- delete sample blocks and stratums --------

        DELETE FROM survey_sample_block
        WHERE survey_sample_site_id IN (
          SELECT survey_sample_site_id
          FROM survey_sample_site
          WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_sample_stratum
        WHERE survey_sample_site_id IN (
          SELECT survey_sample_site_id
          FROM survey_sample_site
          WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_block
        WHERE survey_id = p_survey_id;

        DELETE FROM survey_stratum
        WHERE survey_id = p_survey_id;

        -------- delete sampling data --------

        DELETE FROM survey_sample_period
        WHERE survey_sample_method_id IN (
          SELECT survey_sample_method_id
          FROM survey_sample_method
          WHERE survey_sample_site_id IN (
            SELECT survey_sample_site_id
            FROM survey_sample_site
            WHERE survey_id = p_survey_id
          )
        );

        DELETE FROM survey_sample_method
        WHERE survey_sample_method_id IN (
          SELECT survey_sample_method_id
          FROM survey_sample_method
          WHERE survey_sample_site_id IN (
            SELECT survey_sample_site_id
            FROM survey_sample_site
            WHERE survey_id = p_survey_id
          )
        );

        DELETE FROM survey_sample_site
        WHERE survey_id = p_survey_id;

        -------- delete technique data --------

        DELETE FROM method_technique_attractant
        WHERE method_technique_id IN (
            SELECT method_technique_id
            FROM method_technique
            WHERE survey_id = p_survey_id
        );

        DELETE FROM method_technique_attribute_qualitative
        WHERE method_technique_id IN (
            SELECT method_technique_id
            FROM method_technique
            WHERE survey_id = p_survey_id
        );

        DELETE FROM method_technique_attribute_quantitative
        WHERE method_technique_id IN (
            SELECT method_technique_id
            FROM method_technique
            WHERE survey_id = p_survey_id
        );

        DELETE FROM method_technique_vantage
        WHERE method_technique_id IN (
            SELECT method_technique_id
            FROM method_technique
            WHERE survey_id = p_survey_id
        );

        DELETE FROM method_technique
        WHERE survey_id = p_survey_id;

        -------- delete the survey --------

        DELETE FROM survey
        WHERE survey_id = p_survey_id;

        exception
          when others THEN
            raise;
      END;
    $procedure$;
  `);
}
