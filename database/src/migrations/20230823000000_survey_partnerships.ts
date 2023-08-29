import { Knex } from 'knex';

/**
 * Adds new survey partnerships tables
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Create new survey_stakeholder_partnership table
  ----------------------------------------------------------------------------------------

  SET search_path=biohub;

  CREATE TABLE survey_stakeholder_partnership(
      survey_stakeholder_partnership_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                           integer           NOT NULL,
      name                                varchar(300),
      create_date                         timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                         integer           NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_stakeholder_partnership_pk PRIMARY KEY (survey_stakeholder_partnership_id)
  );
  
  COMMENT ON COLUMN survey_stakeholder_partnership.survey_stakeholder_partnership_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.survey_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.name IS 'The name of the stakeholder.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE survey_stakeholder_partnership IS 'Stakeholder partnerships associated with the project.'
  ;


  ----------------------------------------------------------------------------------------
  -- Create new survey_first_nation_partnership table
  ----------------------------------------------------------------------------------------

  CREATE TABLE survey_first_nation_partnership(
      survey_first_nation_partnership_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      first_nations_id           integer           NOT NULL,
      survey_id                  integer           NOT NULL,
      create_date                timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                integer           NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_first_nation_partnership_pk PRIMARY KEY (survey_first_nation_partnership_id)
  );

  COMMENT ON COLUMN survey_first_nation_partnership.survey_first_nation_partnership_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.first_nations_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.survey_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE survey_first_nation_partnership IS 'A associative entity that joins projects and first nations.'
  ;

  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on survey_id
  ALTER TABLE survey_stakeholder_partnership ADD CONSTRAINT survey_stakeholder_partnership_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  ALTER TABLE survey_first_nation_partnership ADD CONSTRAINT survey_first_nation_partnership_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- Add foreign key index
  CREATE INDEX survey_stakeholder_partnership_idx1 ON survey_stakeholder_partnership(survey_id);

  CREATE INDEX survey_first_nation_partnership_idx1 ON survey_first_nation_partnership(survey_id);

  -- Add unique constraint
  CREATE UNIQUE INDEX survey_stakeholder_partnership_uk1 ON survey_stakeholder_partnership(name, survey_id);

  CREATE UNIQUE INDEX survey_first_nation_partnership_uk1 ON survey_first_nation_partnership(first_nations_id, survey_id);

  -- Create audit and journal triggers
  create trigger audit_observation before insert or update or delete on survey_stakeholder_partnership for each row execute procedure tr_audit_trigger();
  create trigger journal_observation after insert or update or delete on survey_stakeholder_partnership for each row execute procedure tr_journal_trigger();
  create trigger audit_observation before insert or update or delete on survey_first_nation_partnership for each row execute procedure tr_audit_trigger();
  create trigger journal_observation after insert or update or delete on survey_first_nation_partnership for each row execute procedure tr_journal_trigger();


  ----------------------------------------------------------------------------------------
  -- Migrate existing data to new tables
  ----------------------------------------------------------------------------------------

  insert into survey_first_nation_partnership (
    first_nations_id,
    survey_id,
    create_date,
    create_user,
    update_date,
    update_user,
    revision_count
  )(
    select
      fn.first_nations_id,
      s.survey_id,
      fn.create_date,
      fn.create_user,
      null as update_date,
      null as update_user,
      0 as revision_count
    FROM
      project_first_nation fn
    LEFT JOIN
      survey s
    ON
      fn.project_id = s.project_id
    where
      survey_id is not null
  );

  insert into survey_stakeholder_partnership (
    "name",
    survey_id,
    create_date,
    create_user,
    update_date,
    update_user,
    revision_count
  )(
    select
      sp."name",
      s.survey_id,
      sp.create_date,
      sp.create_user,
      null as update_date,
      null as update_user,
      0 as revision_count
    FROM
      stakeholder_partnership sp
    LEFT JOIN
      survey s
    ON
      sp.project_id = s.project_id
    where
      survey_id is not null
  );


  ----------------------------------------------------------------------------------------
  -- Remove old views
  ----------------------------------------------------------------------------------------

  SET search_path=biohub_dapi_v1;
  DROP VIEW biohub_dapi_v1.stakeholder_partnership;
  DROP VIEW biohub_dapi_v1.project_first_nation;

  SET search_path=biohub;

  ----------------------------------------------------------------------------------------
  -- Remove old 'stakeholder_partnership' and 'survey_first_nation_partnership' tables
  ----------------------------------------------------------------------------------------

  DROP TABLE stakeholder_partnership;
  DROP TABLE project_first_nation;

  ----------------------------------------------------------------------------------------
  -- Create views
  ----------------------------------------------------------------------------------------

  set search_path=biohub_dapi_v1;

  create or replace view survey_stakeholder_partnership as select * from biohub.survey_stakeholder_partnership;
  create or replace view survey_first_nation_partnership as select * from biohub.survey_first_nation_partnership;

 
  ----------------------------------------------------------------------------------------
  -- Update api_delete_survey procedure
  ----------------------------------------------------------------------------------------

  set search_path=biohub;

  CREATE OR REPLACE PROCEDURE api_delete_survey(p_survey_id integer)
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $procedure$
   -- *******************************************************************
     -- Procedure: api_delete_survey
     -- Purpose: deletes a survey and dependencies
     --
     -- MODIFICATION HISTORY
     -- Person           Date        Comments
     -- ---------------- ----------- --------------------------------------
     -- shreyas.devalapurkar@quartech.com
     --                  2021-06-18  initial release
     -- charlie.garrettjones@quartech.com
     --                  2021-06-21  added occurrence submission delete
     -- charlie.garrettjones@quartech.com
     --                  2021-09-21  added survey summary submission delete
     -- kjartan.einarsson@quartech.com
     --                  2022-08-28  added survey_vantage, survey_spatial_component, survey delete
     -- charlie.garrettjones@quartech.com
     --                  2022-09-07  changes to permit model
     -- charlie.garrettjones@quartech.com
     --                  2022-10-05  1.3.0 model changes
     -- charlie.garrettjones@quartech.com
     --                  2022-10-05  1.5.0 model changes, drop concept of occurrence deletion for published data
     -- charlie.garrettjones@quartech.com
     --                  2023-03-14  1.7.0 model changes
     -- alfred.rosenthal@quartech.com
     --                  2023-03-15  added missing publish tables to survey delete
     -- curtis.upshall@quartech.com
     --                  2023-04-28  change order of survey delete procedure
     -- alfred.rosenthal@quartech.com
     --                  2023-07-26  delete regions
     -- curtis.upshall@quartech.com
     --                  2023-08-24  delete partnerships
     -- *******************************************************************
     declare

     begin
      with occurrence_submissions as (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id), submission_spatial_components as (select submission_spatial_component_id from submission_spatial_component
      where occurrence_submission_id in (select occurrence_submission_id from occurrence_submissions))
      delete from spatial_transform_submission where submission_spatial_component_id in (select submission_spatial_component_id from submission_spatial_components);
      delete from submission_spatial_component where occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id);

      with occurrence_submissions as (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id)
      , submission_statuses as (select submission_status_id from submission_status
      where occurrence_submission_id in (select occurrence_submission_id from occurrence_submissions))
      delete from submission_message where submission_status_id in (select submission_status_id from submission_statuses);
      delete from submission_status where occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id);

      delete from occurrence_submission_publish where occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id);

      delete from occurrence_submission where survey_id = p_survey_id;
      
      delete from survey_summary_submission_publish where survey_summary_submission_id in (select survey_summary_submission_id from survey_summary_submission where survey_id = p_survey_id);
      delete from survey_summary_submission_message where survey_summary_submission_id in (select survey_summary_submission_id from survey_summary_submission where survey_id = p_survey_id);
      delete from survey_summary_submission where survey_id = p_survey_id;
      delete from survey_proprietor where survey_id = p_survey_id;
      delete from survey_attachment_publish where survey_attachment_id in (select survey_attachment_id from survey_attachment where survey_id = p_survey_id);
      delete from survey_attachment where survey_id = p_survey_id;
      delete from survey_report_author where survey_report_attachment_id in (select survey_report_attachment_id from survey_report_attachment where survey_id = p_survey_id);
      delete from survey_report_publish where survey_report_attachment_id in (select survey_report_attachment_id from survey_report_attachment where survey_id = p_survey_id);
      delete from survey_report_attachment where survey_id = p_survey_id;
      delete from study_species where survey_id = p_survey_id;
      delete from survey_funding_source where survey_id = p_survey_id;
      delete from survey_vantage where survey_id = p_survey_id;
      delete from survey_spatial_component where survey_id = p_survey_id;
      delete from survey_metadata_publish where survey_id = p_survey_id;
      delete from survey_region where survey_id = p_survey_id;
      delete from survey_first_nation_partnership where survey_id = p_survey_id;
      delete from survey_stakeholder_partnership where survey_id = p_survey_id;
      delete from permit where survey_id = p_survey_id;
      delete from survey_type where survey_id = p_survey_id;
      delete from survey where survey_id = p_survey_id;

      exception
        when others THEN
          raise;
      end;
   $procedure$;


   ----------------------------------------------------------------------------------------
   -- Update api_delete_project procedure
   ----------------------------------------------------------------------------------------
 
   CREATE OR REPLACE PROCEDURE api_delete_project(p_project_id integer)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $procedure$
    -- *******************************************************************
    -- Procedure: api_delete_project
    -- Purpose: deletes a project and dependencies
    --
    -- MODIFICATION HISTORY
    -- Person           Date        Comments
    -- ---------------- ----------- --------------------------------------
    -- charlie.garrettjones@quartech.com
    --                  2021-04-19  initial release
    -- charlie.garrettjones@quartech.com
    --                  2021-06-21  added delete survey
    -- charlie.garrettjones@quartech.com
    --                  2022-09-07  changes to permit model
    -- charlie.garrettjones@quartech.com
    --                  2022-12-20  delete security
    -- charlie.garrettjones@quartech.com
    --                  2023-03-14  1.7.0 model changes
    -- alfred.rosenthal@quartech.com
    --                  2023-07-26 removing climate associations, delete project regions, programs, grouping
    -- curtis.upshall@quartech.com
    --                  2023-08-28 partnerships
    -- *******************************************************************
    declare
        _survey_id survey.survey_id%type;
      begin
        for _survey_id in (select survey_id from survey where project_id = p_project_id) loop
          call api_delete_survey(_survey_id);
        end loop;
    
        delete from survey where project_id = p_project_id;
        delete from project_management_actions where project_id = p_project_id;
        delete from project_iucn_action_classification where project_id = p_project_id;
        delete from project_attachment_publish where project_attachment_id in (select project_attachment_id from project_attachment where project_id = p_project_id);
        delete from project_attachment where project_id = p_project_id;
        delete from project_report_author where project_report_attachment_id in (select project_report_attachment_id from project_report_attachment where project_id = p_project_id);
        delete from project_report_publish where project_report_attachment_id in (select project_report_attachment_id from project_report_attachment where project_id = p_project_id);
        delete from project_report_attachment where project_id = p_project_id;
        delete from project_participation where project_id = p_project_id;
        delete from project_metadata_publish where project_id = p_project_id;
        delete from project_region where project_id = p_project_id;
        delete from project_program where project_id = p_project_id;
        delete from grouping_project where project_id = p_project_id;
        delete from project where project_id = p_project_id;
    
    exception
      when others THEN
        raise;    
    end;
    $procedure$;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
