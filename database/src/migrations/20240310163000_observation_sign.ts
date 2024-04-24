import { Knex } from 'knex';

/**
 * Create new tables with initial data:
 * - sign
 *
 * Update existing tables:
 * - Add 'sign' column to subcount table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  ----------------------------------------------------------------------------------------
    -- Create observation subcount sign lookup table
    ----------------------------------------------------------------------------------------
    SET search_path = biohub;

    CREATE TABLE observation_subcount_sign (
      observation_subcount_sign_id                  integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                                          varchar(32)        NOT NULL,
      description                                   varchar(256),
      record_end_date                               timestamptz(6),
      create_date                                   timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                   integer            NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer            DEFAULT 0 NOT NULL,
      CONSTRAINT observation_subcount_sign_pk PRIMARY KEY (observation_subcount_sign_id)
    );

    COMMENT ON TABLE observation_subcount_sign IS 'This table is intended to store options that users can select for the sign of a subcount.';
    COMMENT ON COLUMN observation_subcount_sign.observation_subcount_sign_id IS 'Primary key for observation_subcount_sign.';
    COMMENT ON COLUMN observation_subcount_sign.name IS 'Name of the sign option.';
    COMMENT ON COLUMN observation_subcount_sign.description IS 'Description of the sign option.';
    COMMENT ON COLUMN observation_subcount_sign.record_end_date IS 'End date of the sign option.';
    COMMENT ON COLUMN observation_subcount_sign.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN observation_subcount_sign.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_sign.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN observation_subcount_sign.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_sign.revision_count IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Add triggers for user data
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_observation_subcount_sign BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_sign FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_subcount_sign AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_sign FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Modify observation_subcount table to include sign
    ----------------------------------------------------------------------------------------
    ALTER TABLE observation_subcount ADD COLUMN observation_subcount_sign_id INTEGER;
    COMMENT ON COLUMN observation_subcount.observation_subcount_sign_id IS 'Foreign key referencing the observation subcount sign id.';
    ALTER TABLE observation_subcount ADD CONSTRAINT observation_subcount_sign_fk1 FOREIGN KEY (sign_id) REFERENCES observation_subcount_sign(observation_subcount_sign_id);
    
    ----------------------------------------------------------------------------------------
    -- Indexes on foreign keys
    ----------------------------------------------------------------------------------------
    CREATE UNIQUE INDEX observation_subcount_sign_nuk1 ON observation_subcount_sign(name, (record_end_date is NULL)) where record_end_date is null;
    CREATE INDEX observation_subcount_idx2 ON observation_subcount(observation_subcount_sign_id);

    ----------------------------------------------------------------------------------------
    -- Add initial values
    ----------------------------------------------------------------------------------------
    INSERT INTO observation_subcount_sign (name, description)
    VALUES
    (
      'Direct sighting',
      'Observing the species visually, in person or an image.'
    ),
    (
      'Sound',
      'Detecting the species through noises like calls or songs.'
    ),
    (
      'Tracks',
      'Observing footprints or marks left by the species.'
    ),
    (
      'Refugia',
      'Observing shelters or structures created by the species, like nests, dens, or burrows.'
    ),
    (
      'Hair',
      'Detecting the species by visually analyzing hair or fur left by the species.'
    ),
    (
      'DNA',
      'Detecting the species by analyzing genetic material, such as hair or feces.'
    );

    ----------------------------------------------------------------------------------------
    -- Add view for observation subcount sign table
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE VIEW observation_subcount_sign AS SELECT * FROM biohub.observation_subcount_sign;

    ----------------------------------------------------------------------------------------
    -- Replace observation_subcount view to include sign_id
    ----------------------------------------------------------------------------------------
    CREATE OR REPLACE VIEW observation_subcount AS SELECT * FROM biohub.observation_subcount;
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
