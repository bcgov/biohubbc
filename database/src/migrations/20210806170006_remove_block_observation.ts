import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

// Drop the `block_observation` table.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public, biohub_dapi_v1;

    SET ROLE biohub_api;

    DROP VIEW IF EXISTS biohub_dapi_v1.block_observation;

    SET ROLE postgres;

    DROP TRIGGER IF EXISTS survey_proprietor_val on biohub.survey_proprietor;

    DROP TABLE IF EXISTS ${DB_SCHEMA}.block_observation;

    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;
  `);
}

/**
 * Add the `block_observation` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    --
    -- TABLE: block_observation
    --

    CREATE TABLE ${DB_SCHEMA}.block_observation(
      block_observation_id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      b_id              integer           NOT NULL,
      survey_id         integer           NOT NULL,
      start_datetime    timestamptz(6)    NOT NULL,
      end_datetime      timestamptz(6)    NOT NULL,
      observation_cnt   integer           NOT NULL,
      data              json              NOT NULL,
      create_date       timestamptz(6)    DEFAULT now() NOT NULL,
      create_user       integer           NOT NULL,
      update_date       timestamptz(6),
      update_user       integer,
      revision_count    integer           DEFAULT 0 NOT NULL,
      CONSTRAINT "PK170" PRIMARY KEY (block_observation_id)
    )
    ;

    COMMENT ON COLUMN block_observation.block_observation_id IS 'System generated surrogate primary key identifier.'
    ;
    COMMENT ON COLUMN block_observation.b_id IS 'System generated surrogate primary key identifier.'
    ;
    COMMENT ON COLUMN block_observation.start_datetime IS 'The date and time the observation was started.'
    ;
    COMMENT ON COLUMN block_observation.end_datetime IS 'The date and time the observation ended.'
    ;
    COMMENT ON COLUMN block_observation.observation_cnt IS 'The computed total count of the observations.'
    ;
    COMMENT ON COLUMN block_observation.data IS 'The json data associated with the record.'
    ;
    COMMENT ON COLUMN block_observation.create_date IS 'The datetime the record was created.'
    ;
    COMMENT ON COLUMN block_observation.create_user IS 'The id of the user who created the record as identified in the system user table.'
    ;
    COMMENT ON COLUMN block_observation.update_date IS 'The datetime the record was updated.'
    ;
    COMMENT ON COLUMN block_observation.update_user IS 'The id of the user who updated the record as identified in the system user table.'
    ;
    COMMENT ON COLUMN block_observation.revision_count IS 'Revision count used for concurrency control.'
    ;
    COMMENT ON TABLE block_observation IS 'A persistent store for the block_observation data.';

    -- add unique keys

    ALTER TABLE block_observation ADD CONSTRAINT "Refblock_observation100"
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id)
    ;

    create trigger audit_block_observation before insert or update or delete on biohub.block_observation for each row execute procedure tr_audit_trigger();

    set search_path = biohub_dapi_v1;

    set role biohub_api;

    create or replace view block_observation as select * from ${DB_SCHEMA}.block_observation;

    set role postgres;
  `);
}
