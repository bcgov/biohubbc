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
  -- Create new site_strategy table
  ----------------------------------------------------------------------------------------

  SET search_path=biohub;

  CREATE TABLE site_strategy(
    site_strategy_id                        integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                                    varchar(50)       NOT NULL,
    record_effective_date                   date              NOT NULL,
    description                             varchar(250),
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
  CREATE UNIQUE INDEX site_strategy_uk1 ON site_strategy(name);

  -- Create audit and journal triggers
  create trigger audit_observation before insert or update or delete on site_strategy for each row execute procedure tr_audit_trigger();
  create trigger journal_observation after insert or update or delete on site_strategy for each row execute procedure tr_journal_trigger();

  
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
    type_id                           integer           NOT NULL,
    create_date                       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                       integer           NOT NULL,
    update_date                       timestamptz(6),
    update_user                       integer,
    revision_count                    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_site_strategy_pk PRIMARY KEY (survey_site_strategy_id)
  );
  
  COMMENT ON COLUMN survey_site_strategy.survey_site_strategy_id  IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_site_strategy.survey_id       IS 'A foreign key pointing to the survey table.';
  COMMENT ON COLUMN survey_site_strategy.type_id         IS 'A foreign key pointing to the type table.';
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
    FOREIGN KEY (type_id)
    REFERENCES type(type_id);

  -- add indexes for foreign keys
  CREATE INDEX survey_site_strategy_idx1 ON survey_site_strategy(survey_id);
  CREATE INDEX survey_site_strategy_idx2 ON survey_site_strategy(type_id);
    
  -- add unique index
  CREATE UNIQUE INDEX survey_site_strategy_uk1 ON survey_site_strategy(survey_id, type_id);

  -------------------------------------------------------------------------
  -- Create audit and journal triggers for survey_site_strategy table
  -------------------------------------------------------------------------
  
  CREATE TRIGGER audit_survey_site_strategy BEFORE INSERT OR UPDATE OR DELETE ON survey_site_strategy for each ROW EXECUTE PROCEDURE tr_audit_trigger();
  CREATE TRIGGER journal_survey_site_strategy AFTER INSERT OR UPDATE OR DELETE ON survey_site_strategy for each ROW EXECUTE PROCEDURE tr_journal_trigger();

  ----------------------------------------------------------------------------------------
  -- Create views
  ----------------------------------------------------------------------------------------

  set search_path=biohub_dapi_v1;

  create or replace view site_strategy as select * from biohub.site_strategy;
  create or replace view survey_site_strategy as select * from biohub.survey_site_strategy;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
