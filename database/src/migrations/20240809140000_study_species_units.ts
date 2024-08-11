import { Knex } from 'knex';

/**
 * Create new tables:
 * - study_species_unit
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub;

    -----------------------------------------------------------------------------------------------------------------
    -- CREATE study_species_unit table for associating collection units / ecological units with a survey
    -----------------------------------------------------------------------------------------------------------------
    CREATE TABLE study_species_unit (
      study_species_unit_id                             integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      study_species_id                                  integer            NOT NULL,
      critterbase_collection_category_id                UUID               NOT NULL,
      critterbase_collection_unit_id                    UUID               NOT NULL,
      description                                       VARCHAR(1000),
      create_date                                       timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                       integer            NOT NULL,
      update_date                                       timestamptz(6),
      update_user                                       integer,
      revision_count                                    integer            DEFAULT 0 NOT NULL,
      CONSTRAINT study_species_unit_pk PRIMARY KEY (study_species_unit_id)
    );

    COMMENT ON TABLE study_species_unit IS 'This table is intended to track ecological units of interest for focal species in a survey.';
    COMMENT ON COLUMN study_species_unit.study_species_unit_id IS 'Primary key to the table.';
    COMMENT ON COLUMN study_species_unit.study_species_id IS 'Foreign key to the study_species table.';
    COMMENT ON COLUMN study_species_unit.critterbase_collection_category_id IS 'UUID of an external critterbase collection category.';
    COMMENT ON COLUMN study_species_unit.critterbase_collection_unit_id IS 'UUID of an external critterbase collection unit.';
    COMMENT ON COLUMN study_species_unit.create_date IS 'The description associated with the record.';
    COMMENT ON COLUMN study_species_unit.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN study_species_unit.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN study_species_unit.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN study_species_unit.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN study_species_unit.revision_count IS 'Revision count used for concurrency control.';

    -- Add foreign key constraint
    ALTER TABLE study_species_unit ADD CONSTRAINT study_species_unit_fk1 FOREIGN KEY (study_species_id) REFERENCES study_species(study_species_id);

    -- add indexes for foreign keys
    CREATE INDEX study_species_unit_idx1 ON study_species_unit(study_species_id);

    -- add triggers for user data
    CREATE TRIGGER audit_study_species_unit BEFORE INSERT OR UPDATE OR DELETE ON biohub.study_species_unit FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_study_species_unit AFTER INSERT OR UPDATE OR DELETE ON biohub.study_species_unit FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create measurement table views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;
    CREATE OR REPLACE VIEW study_species_unit AS SELECT * FROM biohub.study_species_unit;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
