import { Knex } from 'knex';

/**
 * Purpose:
 *
 * The purpose of this migration is to move some of the data that was tracked at the observation subcount level to the
 * observation level. This includes the 'sign' data and the 'environment' data.
 *
 * Changes:
 *
 * Move table 'observation_subcount_sign' to "observation_sign'
 * Add column 'observation_sign_id' to 'survey_observation'
 *
 * Move table 'observation_subcount_qualitative_environment' to 'observation_environment_qualitative'
 * Move table 'observation_subcount_quantitative_environment' to 'observation_environment_quantitative'
 *
 * Copy 'observation_subcount_sign' data to 'observation_sign'
 *
 * Migrate 'observation_subcount_sign_id' data from 'observation_subcount' to 'survey_observation'
 *
 * Migrate 'observation_subcount_qualitative_environment' data to 'observation_environment_qualitative'
 * Migrate 'observation_subcount_quantitative_environment' data to 'observation_environment_quantitative'
 *
 * Drop column 'observation_subcount_sign_id' from 'observation_subcount'
 *
 * Drop table 'observation_subcount_sign'
 * Drop table 'observation_subcount_qualitative_environment'
 * Drop table 'observation_subcount_quantitative_environment'
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Create new tables
    ----------------------------------------------------------------------------------------

    CREATE TABLE observation_sign (
      observation_sign_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                   varchar(32)        NOT NULL,
      description            varchar(256),
      record_end_date        timestamptz(6),
      create_date            timestamptz(6)     DEFAULT now() NOT NULL,
      create_user            integer            NOT NULL,
      update_date            timestamptz(6),
      update_user            integer,
      revision_count         integer            DEFAULT 0 NOT NULL,
      CONSTRAINT observation_sign_pk PRIMARY KEY (observation_sign_id)
    );

    COMMENT ON TABLE  observation_sign                        IS 'This table is intended to store options that users can select for the sign of an observation.';
    COMMENT ON COLUMN observation_sign.observation_sign_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN observation_sign.name                   IS 'The name of the sign record.';
    COMMENT ON COLUMN observation_sign.description            IS 'The description of the sign record.';
    COMMENT ON COLUMN observation_sign.record_end_date        IS 'Record level end date.';
    COMMENT ON COLUMN observation_sign.create_date            IS 'The datetime the record was created.';
    COMMENT ON COLUMN observation_sign.create_user            IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN observation_sign.update_date            IS 'The datetime the record was updated.';
    COMMENT ON COLUMN observation_sign.update_user            IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN observation_sign.revision_count         IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE observation_environment_quantitative (
        observation_environment_quantitative_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        survey_observation_id                      integer            NOT NULL,
        environment_quantitative_id                uuid               NOT NULL,
        value                                      numeric            NOT NULL,
        create_date                                timestamptz(6)     DEFAULT now() NOT NULL,
        create_user                                integer            NOT NULL,
        update_date                                timestamptz(6),
        update_user                                integer,
        revision_count                             integer            DEFAULT 0 NOT NULL,
        CONSTRAINT observation_environment_quantitative_pk PRIMARY KEY (observation_environment_quantitative_id)
      );

      COMMENT ON TABLE  observation_environment_quantitative                                            IS 'This table is intended to track quantitative environments applied to a particular observation.';
      COMMENT ON COLUMN observation_environment_quantitative.observation_environment_quantitative_id    IS 'System generated surrogate primary key identifier.';
      COMMENT ON COLUMN observation_environment_quantitative.survey_observation_id                      IS 'Foreign key to the survey_observation table.';
      COMMENT ON COLUMN observation_environment_quantitative.environment_quantitative_id                IS 'Foreign key to the environment_quantitative table.';
      COMMENT ON COLUMN observation_environment_quantitative.value                                      IS 'Quantitative data value.';
      COMMENT ON COLUMN observation_environment_quantitative.create_date                                IS 'The datetime the record was created.';
      COMMENT ON COLUMN observation_environment_quantitative.create_user                                IS 'The id of the user who created the record as identified in the system user table.';
      COMMENT ON COLUMN observation_environment_quantitative.update_date                                IS 'The datetime the record was updated.';
      COMMENT ON COLUMN observation_environment_quantitative.update_user                                IS 'The id of the user who updated the record as identified in the system user table.';
      COMMENT ON COLUMN observation_environment_quantitative.revision_count                             IS 'Revision count used for concurrency control.';

      -- Add unique constraint
      CREATE UNIQUE INDEX observation_environment_quantitative_uk1 ON observation_environment_quantitative(survey_observation_id, environment_quantitative_id);

      -- Add foreign key constraint
      ALTER TABLE observation_environment_quantitative
        ADD CONSTRAINT observation_environment_quantitative_fk1
        FOREIGN KEY (survey_observation_id)
        REFERENCES survey_observation(survey_observation_id);

      ALTER TABLE observation_environment_quantitative
        ADD CONSTRAINT observation_environment_quantitative_fk2
        FOREIGN KEY (environment_quantitative_id)
        REFERENCES environment_quantitative(environment_quantitative_id);

      -- Add indexes for foreign keys
      CREATE INDEX observation_environment_quantitative_idx1 ON observation_environment_quantitative(survey_observation_id);

      CREATE INDEX observation_environment_quantitative_idx2 ON observation_environment_quantitative(environment_quantitative_id);

      ----------------------------------------------------------------------------------------

      CREATE TABLE observation_environment_qualitative (
        observation_environment_qualitative_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        survey_observation_id                     integer            NOT NULL,
        environment_qualitative_id                uuid               NOT NULL,
        environment_qualitative_option_id         uuid               NOT NULL,
        create_date                               timestamptz(6)     DEFAULT now() NOT NULL,
        create_user                               integer            NOT NULL,
        update_date                               timestamptz(6),
        update_user                               integer,
        revision_count                            integer            DEFAULT 0 NOT NULL,
        CONSTRAINT observation_environment_qualitative_pk PRIMARY KEY (observation_environment_qualitative_id)
      );

      COMMENT ON TABLE  observation_environment_qualitative                                           IS 'This table is intended to track qualitative environments applied to a particular observation.';
      COMMENT ON COLUMN observation_environment_qualitative.observation_environment_qualitative_id    IS 'System generated surrogate primary key identifier.';
      COMMENT ON COLUMN observation_environment_qualitative.survey_observation_id                     IS 'Foreign key to the survey_observation table.';
      COMMENT ON COLUMN observation_environment_qualitative.environment_qualitative_id                IS 'Foreign key to the environment_qualitative table.';
      COMMENT ON COLUMN observation_environment_qualitative.environment_qualitative_option_id         IS 'Foreign key to the environment_qualitative_option table.';
      COMMENT ON COLUMN observation_environment_qualitative.create_date                               IS 'The datetime the record was created.';
      COMMENT ON COLUMN observation_environment_qualitative.create_user                               IS 'The id of the user who created the record as identified in the system user table.';
      COMMENT ON COLUMN observation_environment_qualitative.update_date                               IS 'The datetime the record was updated.';
      COMMENT ON COLUMN observation_environment_qualitative.update_user                               IS 'The id of the user who updated the record as identified in the system user table.';
      COMMENT ON COLUMN observation_environment_qualitative.revision_count                            IS 'Revision count used for concurrency control.';

      -- Add unique constraint
      CREATE UNIQUE INDEX observation_environment_qualitative_uk1 ON observation_environment_qualitative(survey_observation_id, environment_qualitative_id, environment_qualitative_option_id);

      -- Add foreign key constraint
      ALTER TABLE observation_environment_qualitative
        ADD CONSTRAINT observation_environment_qualitative_fk1
        FOREIGN KEY (survey_observation_id)
        REFERENCES survey_observation(survey_observation_id);

      ALTER TABLE observation_environment_qualitative
        ADD CONSTRAINT observation_environment_qualitative_fk2
        FOREIGN KEY (environment_qualitative_id)
        REFERENCES environment_qualitative(environment_qualitative_id);

      ALTER TABLE observation_environment_qualitative
        ADD CONSTRAINT observation_environment_qualitative_fk3
        FOREIGN KEY (environment_qualitative_option_id)
        REFERENCES environment_qualitative_option(environment_qualitative_option_id);

      -- Foreign key on both environment_qualitative_id and environment_qualitative_option_id of
      -- environment_qualitative_option to ensure that the combination of those ids in this table has a valid match.
      ALTER TABLE observation_environment_qualitative
        ADD CONSTRAINT observation_environment_qualitative_fk4
        FOREIGN KEY (environment_qualitative_id, environment_qualitative_option_id)
        REFERENCES environment_qualitative_option(environment_qualitative_id, environment_qualitative_option_id);

      -- Add indexes for foreign keys
      CREATE INDEX observation_environment_qualitative_idx1 ON observation_environment_qualitative(survey_observation_id);

      CREATE INDEX observation_environment_qualitative_idx2 ON observation_environment_qualitative(environment_qualitative_id);

      CREATE INDEX observation_environment_qualitative_idx3 ON observation_environment_qualitative(environment_qualitative_option_id);

    ----------------------------------------------------------------------------------------
    -- Alter Existing Tables
    ----------------------------------------------------------------------------------------

    ALTER TABLE survey_observation ADD COLUMN observation_sign_id INTEGER;

    COMMENT ON COLUMN survey_observation.observation_sign_id IS 'Foreign key referencing a record in the observation_sign table.';

    -- Add foreign key constraint
    ALTER TABLE survey_observation
      ADD CONSTRAINT survey_observation_fk5
      FOREIGN KEY (observation_sign_id)
      REFERENCES observation_sign(observation_sign_id);

    -- Add indexes on foreign keys
    CREATE INDEX survey_observation_idx7 ON survey_observation(observation_sign_id);

    ----------------------------------------------------------------------------------------
    -- Add journal/audit triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_observation_sign BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_sign FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_sign AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_sign FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_observation_environment_quantitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_environment_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_environment_quantitative AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_environment_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_observation_environment_qualitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_environment_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_environment_qualitative AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_environment_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Migrate Data
    ----------------------------------------------------------------------------------------

    -- Copy the lookup values from the observation_subcount_sign table into the observation_sign table
    INSERT INTO observation_sign (
      name, 
      description, 
      record_end_date
    ) 
    SELECT 
      name, 
      description, 
      record_end_date 
    FROM 
      observation_subcount_sign;

    -- Migrate the observation_subcount_sign_id values from the observation_subcount table to the survey_observation table
    UPDATE survey_observation
    SET observation_sign_id = (
      SELECT observation_sign_id
      FROM observation_sign
      WHERE observation_sign.name = (
        SELECT observation_subcount_sign.name
        FROM observation_subcount_sign
        INNER JOIN observation_subcount
        ON observation_subcount.observation_subcount_sign_id = observation_subcount_sign.observation_subcount_sign_id
        WHERE observation_subcount.survey_observation_id = survey_observation.survey_observation_id
      )
    );

    -- Migrate the observation_subcount_qualitative_environment values to the observation_environment_qualitative table
    INSERT INTO observation_environment_qualitative (
      survey_observation_id,
      environment_qualitative_id,
      environment_qualitative_option_id
    )
    SELECT
      observation_subcount.survey_observation_id,
      observation_subcount_qualitative_environment.environment_qualitative_id,
      observation_subcount_qualitative_environment.environment_qualitative_option_id
    FROM observation_subcount
    INNER JOIN observation_subcount_qualitative_environment
    ON observation_subcount_qualitative_environment.observation_subcount_id = observation_subcount.observation_subcount_id;

    -- Migrate the observation_subcount_quantitative_environment values to the observation_environment_quantitative table
    INSERT INTO observation_environment_quantitative (
      survey_observation_id,
      environment_quantitative_id,
      value
    )
    SELECT
      observation_subcount.survey_observation_id,
      observation_subcount_quantitative_environment.environment_quantitative_id,
      observation_subcount_quantitative_environment.value
    FROM observation_subcount
    INNER JOIN observation_subcount_quantitative_environment
    ON observation_subcount_quantitative_environment.observation_subcount_id = observation_subcount.observation_subcount_id;

    ----------------------------------------------------------------------------------------
    -- Drop Deprecated Columns
    ----------------------------------------------------------------------------------------

    ALTER TABLE observation_subcount DROP COLUMN observation_subcount_sign_id;

    ----------------------------------------------------------------------------------------
    -- Drop Deprecated Tables
    ----------------------------------------------------------------------------------------

    DROP TABLE observation_subcount_sign;
    DROP TABLE observation_subcount_qualitative_environment;
    DROP TABLE observation_subcount_quantitative_environment;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
