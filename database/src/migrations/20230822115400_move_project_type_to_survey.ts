import { Knex } from 'knex';

/**
 * Added new program and project_program for tracking programs (used to be project type)
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -------------------------------------------------------------------------
    -- Drop old views and constraints
    -------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    -- drop old views
    DROP VIEW project_type;

    -------------------------------------------------------------------------
    -- Create new survey_type tables
    -------------------------------------------------------------------------

    SET SEARCH_PATH=biohub;

    CREATE TABLE survey_type(
      survey_type_id           integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                integer           NOT NULL,
      type_id                  integer           NOT NULL,
      create_date              timestamptz(6)    DEFAULT now() NOT NULL,
      create_user              integer           NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_type_pk PRIMARY KEY (survey_type_id)
    );
    
    COMMENT ON COLUMN survey_type.survey_type_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_type.survey_id       IS 'A foreign key pointing to the survey table.';
    COMMENT ON COLUMN survey_type.type_id         IS 'A foreign key pointing to the type table.';
    COMMENT ON COLUMN survey_type.create_date     IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_type.create_user     IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_type.update_date     IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_type.update_user     IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_type.revision_count  IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  survey_type                 IS 'Broad classification for the survey.';

    -------------------------------------------------------------------------
    -- Add survey_type constraints and indexes
    -------------------------------------------------------------------------

    -- add foreign key constraints
    ALTER TABLE survey_type ADD CONSTRAINT survey_type_fk1
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id);

    ALTER TABLE survey_type ADD CONSTRAINT survey_type_fk2
      FOREIGN KEY (type_id)
      REFERENCES type(type_id);
  
    -- add indexes for foreign keys
    CREATE INDEX survey_type_idx1 ON survey_type(survey_id);
    CREATE INDEX survey_type_idx2 ON survey_type(type_id);
      
    -- add unique index
    CREATE UNIQUE INDEX survey_type_uk1 ON survey_type(survey_id, type_id);

    -------------------------------------------------------------------------
    -- Create audit and journal triggers for survey_type table
    -------------------------------------------------------------------------
    
    CREATE TRIGGER audit_survey_type BEFORE INSERT OR UPDATE OR DELETE ON survey_type for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_type AFTER INSERT OR UPDATE OR DELETE ON survey_type for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    -------------------------------------------------------------------------
    -- Migrate old project_type data to new survey_type table
    -------------------------------------------------------------------------

    INSERT INTO survey_type (
      survey_id,
      type_id
    )
    SELECT 
      survey.survey_id, 
      project_type.type_id
    FROM 
      project
    JOIN 
      survey
      ON project.project_id = survey.project_id
    JOIN
      project_type
      ON project_type.project_id = project.project_id;

    -------------------------------------------------------------------------
    -- Drop old project_type table
    -------------------------------------------------------------------------

    DROP TABLE project_type;

    -------------------------------------------------------------------------
    -- Create views
    -------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW survey_type as select * from biohub.survey_type;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
