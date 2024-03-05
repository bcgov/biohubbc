import { Knex } from 'knex';

/**
 * Create new tables:
 * - observation_subcount
 * - subcount_critter
 * - subcount_event
 *
 * Create new function/trigger:
 * - tr_observation_subcount_count
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
    DROP VIEW IF EXISTS biohub_dapi_v1.subcount_event;
    DROP TABLE IF EXISTS subcount_event;

    ----------------------------------------------------------------------------------------
    -- Create measurement tables
    ----------------------------------------------------------------------------------------
    CREATE TABLE observation_subcount_quantitative_measurement (
      observation_subcount_id INTEGER NOT NULL,
      measurement_quantitative_id UUID NOT NULL,
      value VARCHAR(100),
      create_date                timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                integer            NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer            DEFAULT 0 NOT NULL,
      
      CONSTRAINT observation_subcount_quantitative_measurement_pk PRIMARY KEY (observation_subcount_id, measurement_quantitative_id)
    );

    COMMENT ON COLUMN observation_subcount_quantitative_measurement.observation_subcount_id IS 'Foreign key to the subcount table';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.measurement_quantitative_id IS 'UUID of the measurement associated to a subcount';
    COMMENT ON COLUMN observation_subcount_quantitative_measurement.value IS 'String representation of the data provided';

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
      observation_subcount_id INTEGER NOT NULL,
      measurement_qualitative_id UUID NOT NULL,
      qualitative_option_id UUID NOT NULL,
      create_date                timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                integer            NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer            DEFAULT 0 NOT NULL,

      CONSTRAINT observation_subcount_qualitative_measurement_pk PRIMARY KEY (observation_subcount_id, measurement_qualitative_id)
    );

    COMMENT ON COLUMN observation_subcount_qualitative_measurement.observation_subcount_id IS 'String representation of the data provided';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.measurement_qualitative_id IS 'UUID of the measurement associated to a subcount';
    COMMENT ON COLUMN observation_subcount_qualitative_measurement.qualitative_option_id IS 'UUID UUID of the option selected for the given measurement';
    
    -- Add foreign key constraint
    ALTER TABLE observation_subcount_qualitative_measurement 
    ADD CONSTRAINT observation_subcount_qualitative_measurement_fk1 FOREIGN KEY (observation_subcount_id)
    REFERENCES observation_subcount(observation_subcount_id);

    -- add indexes for foreign keys
    CREATE INDEX observation_subcount_qualitative_measurement_idx1 ON observation_subcount_qualitative_measurement(observation_subcount_id);

    -- add triggers for user data
    CREATE TRIGGER audit_observation_subcount_qualitative_measurement BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_qualitative_measurement FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_subcount_qualitative_measurement AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_qualitative_measurement FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
