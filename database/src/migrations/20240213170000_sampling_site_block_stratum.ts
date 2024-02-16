import { Knex } from 'knex';

/**
 * Added survey_sample_block table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

    ----------------------------------------------------------------------------------------
    -- Create new survey_sample_block table
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub;

    CREATE TABLE survey_sample_block(
      survey_sample_block_id                  integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_sample_site_id                   INTEGER           NOT NULL,
      survey_block_id                         INTEGER           NOT NULL,
      create_date                             TIMESTAMPTZ(6)    DEFAULT NOW() NOT NULL,
      create_user                             INTEGER           NOT NULL,
      update_date                             TIMESTAMPTZ(6),
      update_user                             INTEGER,
      revision_count                          int4              NOT NULL DEFAULT 0,
      CONSTRAINT survey_sample_block_pk PRIMARY KEY (survey_sample_block_id)
    );

    COMMENT ON COLUMN survey_sample_block.survey_sample_block_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_sample_block.survey_sample_site_id IS 'The sampling site id of the sampling site block.';
    COMMENT ON COLUMN survey_sample_block.survey_block_id IS 'The survey id of the sampling site block.';
    COMMENT ON COLUMN survey_sample_block.create_date IS 'The date the sampling site block was created.';
    COMMENT ON COLUMN survey_sample_block.create_user IS 'The user id of the sampling site block creator.';
    COMMENT ON COLUMN survey_sample_block.update_date IS 'The date the sampling site block was updated.';
    COMMENT ON COLUMN survey_sample_block.update_user IS 'The user id of the sampling site block updater.';
    COMMENT ON TABLE survey_sample_block IS 'Sampling site block table.';
    COMMENT ON TABLE survey_sample_block IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Create new keys and indices
    ----------------------------------------------------------------------------------------

    -- Add foreign key constraint from child table to parent table on survey_sample_block
    ALTER TABLE survey_sample_block ADD CONSTRAINT survey_sample_block_fk1
      FOREIGN KEY (survey_sample_site_id)
      REFERENCES survey_sample_site(survey_sample_site_id);

    -- Add foreign key constraint from child table to parent table on survey_sample_block
    ALTER TABLE survey_sample_block ADD CONSTRAINT survey_sample_block_fk2
      FOREIGN KEY (survey_block_id)
      REFERENCES survey_block(survey_block_id);

    -- Add foreign key index
    CREATE INDEX survey_sample_block_idx1 ON survey_sample_block(survey_sample_site_id);
    CREATE INDEX survey_sample_block_idx2 ON survey_sample_block(survey_block_id);

    -- Create audit and journal triggers (make sure tr_audit_trigger and tr_journal_trigger are defined)
    CREATE TRIGGER audit_survey_sample_block BEFORE INSERT OR UPDATE OR DELETE ON survey_sample_block
      FOR EACH ROW EXECUTE FUNCTION tr_audit_trigger();
    CREATE TRIGGER journal_survey_sample_block AFTER INSERT OR UPDATE OR DELETE ON survey_sample_block
      FOR EACH ROW EXECUTE FUNCTION tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create new survey_sample_stratum table
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_sample_stratum(
      survey_sample_stratum_id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_sample_site_id                   INTEGER           NOT NULL,
      survey_stratum_id                       INTEGER           NOT NULL,
      create_date                             TIMESTAMPTZ(6)    DEFAULT NOW() NOT NULL,
      create_user                             INTEGER           NOT NULL,
      update_date                             TIMESTAMPTZ(6),
      update_user                             INTEGER
    );

    COMMENT ON COLUMN survey_sample_stratum.survey_sample_stratum_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_sample_stratum.survey_sample_site_id IS 'The sampling site id of the sampling site stratum.';
    COMMENT ON COLUMN survey_sample_stratum.survey_stratum_id IS 'The survey id of the sampling site stratum.';
    COMMENT ON COLUMN survey_sample_stratum.create_date IS 'The date the sampling site stratum was created.';
    COMMENT ON COLUMN survey_sample_stratum.create_user IS 'The user id of the sampling site stratum creator.';
    COMMENT ON COLUMN survey_sample_stratum.update_date IS 'The date the sampling site stratum was updated.';
    COMMENT ON COLUMN survey_sample_stratum.update_user IS 'The user id of the sampling site stratum updater.';
    COMMENT ON TABLE survey_sample_stratum IS 'Sampling site stratum table';

    ----------------------------------------------------------------------------------------
    -- Create new keys and indices
    ----------------------------------------------------------------------------------------

    -- Add foreign key constraint from child table to parent table on survey_sample_stratum
    ALTER TABLE survey_sample_stratum ADD CONSTRAINT survey_sample_stratum_fk1
      FOREIGN KEY (survey_sample_site_id)
      REFERENCES survey_sample_site(survey_sample_site_id);

    -- Add foreign key constraint from child table to parent table on survey_sample_stratum
    ALTER TABLE survey_sample_stratum ADD CONSTRAINT survey_sample_stratum_fk2
      FOREIGN KEY (survey_stratum_id)
      REFERENCES survey_stratum(survey_stratum_id);

    -- Add foreign key index
    CREATE INDEX survey_sample_stratum_idx1 ON survey_sample_stratum(survey_sample_site_id);
    CREATE INDEX survey_sample_stratum_idx2 ON survey_sample_stratum(survey_stratum_id);

    -- Create audit and journal triggers (make sure tr_audit_trigger and tr_journal_trigger are defined)
    CREATE TRIGGER audit_survey_sample_stratum BEFORE INSERT OR UPDATE OR DELETE ON survey_sample_stratum
      FOR EACH ROW EXECUTE FUNCTION tr_audit_trigger();
    CREATE TRIGGER journal_survey_sample_stratum AFTER INSERT OR UPDATE OR DELETE ON survey_sample_stratum
      FOR EACH ROW EXECUTE FUNCTION tr_journal_trigger();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
