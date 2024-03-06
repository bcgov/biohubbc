import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    CREATE OR REPLACE PROCEDURE api_delete_survey(p_survey_id integer)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $procedure$
    
      declare

      BEGIN

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
        
        DELETE FROM study_species
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_funding_source
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_vantage
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_spatial_component 
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_metadata_publish
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_region
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_first_nation_partnership
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_block
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
        
        DELETE FROM survey_stratum
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_block
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_site_strategy
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_location
        WHERE survey_id = p_survey_id;
        
        DELETE FROM deployment
        WHERE critter_id IN (SELECT critter_id FROM critter WHERE survey_id = p_survey_id);
        
        DELETE FROM critter
        WHERE survey_id = p_survey_id;
        
        DELETE FROM survey_intended_outcome
        WHERE survey_id = p_survey_id;

        -------- delete observation data --------

        DELETE FROM observation_subcount
        WHERE survey_observation_id IN (
          SELECT survey_observation_id FROM survey_observation
          WHERE survey_id = p_survey_id
        );

        DELETE FROM survey_observation
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
