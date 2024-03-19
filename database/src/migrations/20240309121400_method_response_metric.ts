import { Knex } from 'knex';

/**
 * Create new tables with initial seed data:
 * - method_response_metric
 *
 * Update existing tables:
 * - Add 'method_response_metric_id' column to Survey table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Create method response metric lookup table
    ----------------------------------------------------------------------------------------
    SET search_path = biohub;

    CREATE TABLE method_response_metric (
      method_response_metric_id                     integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                                          varchar(32)        NOT NULL,
      description                                   varchar(128),
      record_end_date                               timestamptz(6),
      create_date                                   timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                   integer            NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer            DEFAULT 0 NOT NULL,
      CONSTRAINT method_response_metric_id_pk PRIMARY KEY (method_response_metric_id)
    );

    COMMENT ON TABLE method_response_metric IS 'This table is intended to store options that users can select for the response metric of a sampling method.';
    COMMENT ON COLUMN method_response_metric.method_response_metric_id IS 'Primary key for method_response_metric.';
    COMMENT ON COLUMN method_response_metric.name IS 'Name of the response metric option.';
    COMMENT ON COLUMN method_response_metric.description IS 'Description of the response metric option.';
    COMMENT ON COLUMN method_response_metric.record_end_date IS 'End date of the response metric option.';
    COMMENT ON COLUMN method_response_metric.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_response_metric.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_response_metric.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_response_metric.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_response_metric.revision_count IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Add triggers for user data
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_method_response_metric BEFORE INSERT OR UPDATE OR DELETE ON biohub.method_response_metric FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_response_metric AFTER INSERT OR UPDATE OR DELETE ON biohub.method_response_metric FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Add initial values
    ----------------------------------------------------------------------------------------
    INSERT INTO method_response_metric (name, description)
    VALUES
    (
      'Count',
      'Counting the number of individuals at a sampling site.'
    ),
    (
      'Presence-absence',
      'Recording the presence or absence of species at a sampling site, irrespective of abundance.'
    ),
    (
      'Percent cover',
      'Estimating the percentage area that a species covers at a sampling site.'
    ),
    (
      'Biomass',
      'Measuring the weight or biomass of a species at a sampling site.'
    );

    ----------------------------------------------------------------------------------------
    -- Modify sample method table to include method_response_metric
    ----------------------------------------------------------------------------------------
    ALTER TABLE survey_sample_method ADD COLUMN method_response_metric_id INTEGER;
    COMMENT ON COLUMN survey_sample_method.method_response_metric_id IS 'Foreign key referencing the response metric value.';
    
    -- Add initial values to survey_sample_method table
    UPDATE survey_sample_method
    SET method_response_metric_id = (
      SELECT method_response_metric_id 
      FROM method_response_metric 
      WHERE name = 'Count'
    );

    -- Add not null constraint
    ALTER TABLE survey_sample_method ALTER COLUMN method_response_metric_id SET NOT NULL;
    ALTER TABLE survey_sample_method ADD CONSTRAINT method_response_metric_fk FOREIGN KEY (method_response_metric_id) REFERENCES method_response_metric(method_response_metric_id);
    
    -- Add index
    CREATE INDEX method_response_metric_idx1 ON survey_sample_method(method_response_metric_id);

    ----------------------------------------------------------------------------------------
    -- Add view for method_response_metric table
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE VIEW method_response_metric AS SELECT * FROM biohub.method_response_metric;

    ----------------------------------------------------------------------------------------
    -- Replace survey_sample_method view to include method_response_metric_id
    ----------------------------------------------------------------------------------------
    CREATE OR REPLACE VIEW survey_sample_method AS SELECT * FROM biohub.survey_sample_method;
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
