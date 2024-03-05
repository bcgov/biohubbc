import { Knex } from 'knex';

/**
 * Create new tables:
 * - observation_subcount_quantitative_measurement
 * - observation_subcount_qualitative_measurement
 *
 * Drop old tables:
 * - subcount_event
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- DROP subcount_event table
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;
    DROP VIEW IF EXISTS biohub_dapi_v1.subcount_event;
    
    -- Dropping this table lieu of tracking measurements per sub count in tables below
    SET SEARCH_PATH=biohub, public;
    DROP TABLE IF EXISTS subcount_event;

    ----------------------------------------------------------------------------------------
    -- Create measurement tables
    ----------------------------------------------------------------------------------------
    CREATE TABLE observation_subcount_quantitative_measurement (
      observation_subcount_id                       integer            NOT NULL,
      critterbase_measurement_quantitative_id       UUID               NOT NULL,
      value                                         numeric,
      create_date                                   timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                   integer            NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer            DEFAULT 0 NOT NULL,
      
      CONSTRAINT observation_subcount_quantitative_measurement_pk PRIMARY KEY (observation_subcount_id, critterbase_measurement_quantitative_id)
    );

    COMMENT ON TABLE observation_subcount_quantitative_measurement IS 'This table is intended to track quantitative measurements applied to a particular observation_subcount';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.observation_subcount_id IS 'Foreign key to the subcount table';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.critterbase_measurement_quantitative_id IS 'UUID of an external CritterBase measurement associated to a observation_subcount';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.value IS 'Quantitative data value';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.revision_count IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE observation_subcount_quantitative_measurement 
    ADD CONSTRAINT observation_subcount_quantitative_measurement_fk1 FOREIGN KEY (observation_subcount_id)
    REFERENCES observation_subcount(observation_subcount_id);

    -- add indexes for foreign keys
    CREATE INDEX observation_subcount_quantitative_measurement_idx1 ON observation_subcount_quantitative_measurement(observation_subcount_id);

    -- add triggers for user data
    CREATE TRIGGER audit_observation_subcount_quantitative_measurement BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_quantitative_measurement FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_subcount_quantitative_measurement AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_quantitative_measurement FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();


    CREATE TABLE observation_subcount_qualitative_measurement (
      observation_subcount_id                             integer         NOT NULL,
      critterbase_measurement_qualitative_id              UUID            NOT NULL,
      critterbase_measurement_qualitative_option_id       UUID            NOT NULL,
      create_date                                         timestamptz(6)  DEFAULT now() NOT NULL,
      create_user                                         integer         NOT NULL,
      update_date                                         timestamptz(6),
      update_user                                         integer,
      revision_count                                      integer         DEFAULT 0 NOT NULL,

      CONSTRAINT observation_subcount_qualitative_measurement_pk PRIMARY KEY (observation_subcount_id, critterbase_measurement_qualitative_id)
    );

    COMMENT ON TABLE observation_subcount_qualitative_measurement IS 'This table is intended to track qualitative measurements applied to a particular observation_subcount';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.observation_subcount_id IS 'String representation of the data provided';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.critterbase_measurement_qualitative_id IS 'UUID of an external CritterBase measurement associated to a observation_subcount';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.critterbase_measurement_qualitative_option_id IS 'UUID of an external CritterBase measurement option selected for the given CritterBase measurement';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.revision_count IS 'Revision count used for concurrency control.';
    
    -- Add foreign key constraint
    ALTER TABLE observation_subcount_qualitative_measurement 
    ADD CONSTRAINT observation_subcount_qualitative_measurement_fk1 FOREIGN KEY (observation_subcount_id)
    REFERENCES observation_subcount(observation_subcount_id);

    -- add indexes for foreign keys
    CREATE INDEX observation_subcount_qualitative_measurement_idx1 ON observation_subcount_qualitative_measurement(observation_subcount_id);

    -- add triggers for user data
    CREATE TRIGGER audit_observation_subcount_qualitative_measurement BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_qualitative_measurement FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_subcount_qualitative_measurement AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_qualitative_measurement FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create measurement table views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;
    CREATE OR REPLACE VIEW observation_subcount_quantitative_measurement AS SELECT * FROM biohub.observation_subcount_quantitative_measurement;
    CREATE OR REPLACE VIEW observation_subcount_qualitative_measurement AS SELECT * FROM biohub.observation_subcount_qualitative_measurement;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
