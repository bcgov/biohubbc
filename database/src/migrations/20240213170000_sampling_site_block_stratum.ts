import { Knex } from 'knex';

/**
 * Added sampling_site_block table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

    ----------------------------------------------------------------------------------------
    -- Create new sampling_site_block table
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub;

    CREATE TABLE sampling_site_block(
      sampling_site_block_id                  integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_sample_site_id                   INTEGER           NOT NULL,
      survey_block_id                         INTEGER           NOT NULL,
      create_date                             TIMESTAMPTZ(6)    DEFAULT NOW() NOT NULL,
      create_user                             INTEGER           NOT NULL,
      update_date                             TIMESTAMPTZ(6),
      update_user                             INTEGER
    );

    COMMENT ON COLUMN sampling_site_block.sampling_site_block_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN sampling_site_block.survey_sample_site_id IS 'The sampling site id of the sampling site block.';
    COMMENT ON COLUMN sampling_site_block.survey_block_id IS 'The survey id of the sampling site block.';
    COMMENT ON COLUMN sampling_site_block.create_date IS 'The date the sampling site block was created.';
    COMMENT ON COLUMN sampling_site_block.create_user IS 'The user id of the sampling site block creator.';
    COMMENT ON COLUMN sampling_site_block.update_date IS 'The date the sampling site block was updated.';
    COMMENT ON COLUMN sampling_site_block.update_user IS 'The user id of the sampling site block updater.';
    COMMENT ON TABLE sampling_site_block IS 'Sampling site block table';

    ----------------------------------------------------------------------------------------
    -- Create new keys and indices
    ----------------------------------------------------------------------------------------

    -- Add foreign key constraint from child table to parent table on sampling_site_block
    ALTER TABLE sampling_site_block ADD CONSTRAINT sampling_site_block_fk1
      FOREIGN KEY (survey_sample_site_id)
      REFERENCES survey_sample_site(survey_sample_site_id);

    -- Add foreign key constraint from child table to parent table on sampling_site_block
    ALTER TABLE sampling_site_block ADD CONSTRAINT sampling_site_block_fk2
      FOREIGN KEY (survey_block_id)
      REFERENCES survey_block(survey_block_id);

    -- Add foreign key index
    CREATE INDEX sampling_site_block_idx1 ON sampling_site_block(survey_sample_site_id);
    CREATE INDEX sampling_site_block_idx2 ON sampling_site_block(survey_block_id);

    -- Create audit and journal triggers (make sure tr_audit_trigger and tr_journal_trigger are defined)
    CREATE TRIGGER audit_sampling_site_block BEFORE INSERT OR UPDATE OR DELETE ON sampling_site_block
      FOR EACH ROW EXECUTE FUNCTION tr_audit_trigger();
    CREATE TRIGGER journal_sampling_site_block AFTER INSERT OR UPDATE OR DELETE ON sampling_site_block
      FOR EACH ROW EXECUTE FUNCTION tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create new sampling_site_stratum table
    ----------------------------------------------------------------------------------------

    CREATE TABLE sampling_site_stratum(
      sampling_site_stratum_id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_sample_site_id                   INTEGER           NOT NULL,
      survey_stratum_id                       INTEGER           NOT NULL,
      create_date                             TIMESTAMPTZ(6)    DEFAULT NOW() NOT NULL,
      create_user                             INTEGER           NOT NULL,
      update_date                             TIMESTAMPTZ(6),
      update_user                             INTEGER
    );

    COMMENT ON COLUMN sampling_site_stratum.sampling_site_stratum_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN sampling_site_stratum.survey_sample_site_id IS 'The sampling site id of the sampling site stratum.';
    COMMENT ON COLUMN sampling_site_stratum.survey_stratum_id IS 'The survey id of the sampling site stratum.';
    COMMENT ON COLUMN sampling_site_stratum.create_date IS 'The date the sampling site stratum was created.';
    COMMENT ON COLUMN sampling_site_stratum.create_user IS 'The user id of the sampling site stratum creator.';
    COMMENT ON COLUMN sampling_site_stratum.update_date IS 'The date the sampling site stratum was updated.';
    COMMENT ON COLUMN sampling_site_stratum.update_user IS 'The user id of the sampling site stratum updater.';
    COMMENT ON TABLE sampling_site_stratum IS 'Sampling site stratum table';

    ----------------------------------------------------------------------------------------
    -- Create new keys and indices
    ----------------------------------------------------------------------------------------

    -- Add foreign key constraint from child table to parent table on sampling_site_stratum
    ALTER TABLE sampling_site_stratum ADD CONSTRAINT sampling_site_stratum_fk1
      FOREIGN KEY (survey_sample_site_id)
      REFERENCES survey_sample_site(survey_sample_site_id);

    -- Add foreign key constraint from child table to parent table on sampling_site_stratum
    ALTER TABLE sampling_site_stratum ADD CONSTRAINT sampling_site_stratum_fk2
      FOREIGN KEY (survey_stratum_id)
      REFERENCES survey_stratum(survey_stratum_id);

    -- Add foreign key index
    CREATE INDEX sampling_site_stratum_idx1 ON sampling_site_stratum(survey_sample_site_id);
    CREATE INDEX sampling_site_stratum_idx2 ON sampling_site_stratum(survey_stratum_id);

    -- Create audit and journal triggers (make sure tr_audit_trigger and tr_journal_trigger are defined)
    CREATE TRIGGER audit_sampling_site_stratum BEFORE INSERT OR UPDATE OR DELETE ON sampling_site_stratum
      FOR EACH ROW EXECUTE FUNCTION tr_audit_trigger();
    CREATE TRIGGER journal_sampling_site_stratum AFTER INSERT OR UPDATE OR DELETE ON sampling_site_stratum
      FOR EACH ROW EXECUTE FUNCTION tr_journal_trigger();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
