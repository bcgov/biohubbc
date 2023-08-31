import { Knex } from 'knex';

/**
 * 1. Adds two new tables:
 *  - Codes table for site selection strategy
 *  - Xref table for survey site selection strategies
 * 2. Updates the survey delete procedure to account for blocks, stratums and survey site selection strategies
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Create new site_strategy table
  ----------------------------------------------------------------------------------------

  SET search_path=biohub;

  CREATE TABLE site_strategy(
    site_strategy_id                        integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                                    varchar(50)       NOT NULL,
    description                             varchar(250),
    record_effective_date                   date              NOT NULL,
    record_end_date                         date,
    create_date                             timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                             integer           NOT NULL,
    update_date                             timestamptz(6),
    update_user                             integer,
    revision_count                          integer           DEFAULT 0 NOT NULL,
    CONSTRAINT site_strategy_pk PRIMARY KEY (site_strategy_id)
  );


  COMMENT ON COLUMN site_strategy.site_strategy_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN site_strategy.name IS 'The name of the site selection strategy.'
  ;
  COMMENT ON COLUMN site_strategy.record_effective_date IS 'Record level effective date.'
  ;
  COMMENT ON COLUMN site_strategy.description IS 'The description of the site selection strategy.'
  ;
  COMMENT ON COLUMN site_strategy.record_end_date IS 'Record level end date.'
  ;
  COMMENT ON COLUMN site_strategy.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN site_strategy.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN site_strategy.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN site_strategy.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN site_strategy.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE site_strategy IS 'Broad classification for the site_strategy code of the survey.'
  ;


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add unique constraint
  CREATE UNIQUE INDEX site_strategy_nuk1 ON site_strategy(name, (record_end_date is NULL)) where record_end_date is null;

  -- Create audit and journal triggers
  create trigger audit_site_strategy before insert or update or delete on site_strategy for each row execute procedure tr_audit_trigger();
  create trigger journal_site_strategy after insert or update or delete on site_strategy for each row execute procedure tr_journal_trigger();

  
  ----------------------------------------------------------------------------------------
  -- Insert seed values
  ----------------------------------------------------------------------------------------

  insert into site_strategy (name, record_effective_date) values ('Random', now());
  insert into site_strategy (name, record_effective_date) values ('Stratified', now());
  insert into site_strategy (name, record_effective_date) values ('Systematic', now());

  -------------------------------------------------------------------------
  -- Create new survey_site_strategy table
  -------------------------------------------------------------------------

  SET SEARCH_PATH=biohub;

  CREATE TABLE survey_site_strategy(
    survey_site_strategy_id           integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_id                         integer           NOT NULL,
    site_strategy_id                  integer           NOT NULL,
    create_date                       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                       integer           NOT NULL,
    update_date                       timestamptz(6),
    update_user                       integer,
    revision_count                    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_site_strategy_pk PRIMARY KEY (survey_site_strategy_id)
  );
  
  COMMENT ON COLUMN survey_site_strategy.survey_site_strategy_id  IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_site_strategy.survey_id       IS 'A foreign key pointing to the survey table.';
  COMMENT ON COLUMN survey_site_strategy.site_strategy_id         IS 'A foreign key pointing to the type table.';
  COMMENT ON COLUMN survey_site_strategy.create_date     IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_site_strategy.create_user     IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_site_strategy.update_date     IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_site_strategy.update_user     IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_site_strategy.revision_count  IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE  survey_site_strategy                 IS 'Site selection strategy classification for the survey.';

  -------------------------------------------------------------------------
  -- Add survey_site_strategy constraints and indexes
  -------------------------------------------------------------------------

  -- add foreign key constraints
  ALTER TABLE survey_site_strategy ADD CONSTRAINT survey_site_strategy_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  ALTER TABLE survey_site_strategy ADD CONSTRAINT survey_site_strategy_fk2
    FOREIGN KEY (site_strategy_id)
    REFERENCES site_strategy(site_strategy_id);

  -- add indexes for foreign keys
  CREATE INDEX survey_site_strategy_idx1 ON survey_site_strategy(survey_id);
  CREATE INDEX survey_site_strategy_idx2 ON survey_site_strategy(site_strategy_id);
    
  -- add unique index
  CREATE UNIQUE INDEX survey_site_strategy_uk1 ON survey_site_strategy(survey_id, site_strategy_id);

  -------------------------------------------------------------------------
  -- Create audit and journal triggers for survey_site_strategy table
  -------------------------------------------------------------------------
  
  CREATE TRIGGER audit_survey_site_strategy BEFORE INSERT OR UPDATE OR DELETE ON survey_site_strategy for each ROW EXECUTE PROCEDURE tr_audit_trigger();
  CREATE TRIGGER journal_survey_site_strategy AFTER INSERT OR UPDATE OR DELETE ON survey_site_strategy for each ROW EXECUTE PROCEDURE tr_journal_trigger();

  ----------------------------------------------------------------------------------------
  -- Create new views for both new tables
  ----------------------------------------------------------------------------------------

  set search_path=biohub_dapi_v1;

  create or replace view site_strategy as select * from biohub.site_strategy;
  create or replace view survey_site_strategy as select * from biohub.survey_site_strategy;

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
     -- curtis.upshall@quartech.com
     --                  2023-08-24  delete survey blocks and stratums and participation
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
      delete from survey_block where survey_id = p_survey_id;
      delete from permit where survey_id = p_survey_id;
      delete from survey_type where survey_id = p_survey_id;
      delete from survey_first_nation_partnership where survey_id = p_survey_id;
      delete from survey_stakeholder_partnership where survey_id = p_survey_id;
      delete from survey_participation where survey_id = p_survey_id;
      delete from survey_stratum where survey_id = p_survey_id;
      delete from survey_block where survey_id = p_survey_id;
      delete from survey_site_strategy where survey_id = p_survey_id; 
      delete from survey where survey_id = p_survey_id;

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
