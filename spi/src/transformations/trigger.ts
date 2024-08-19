import { Knex } from 'knex';

/**
 * Add columns to the following tables for the SPI data migration:
 * - project
 * - survey
 * - study species
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql  
    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Insert SPI user which will perform the transform and be recorded in the audit columns (eg. created by)
    ----------------------------------------------------------------------------------------
    -- Inserting a new system user record for SPI data transformation, referencing audit columns.
    INSERT INTO system_user (user_identity_source_id, user_identifier, display_name, user_guid, email, record_effective_date) 
    VALUES (
        (SELECT user_identity_source_id FROM user_identity_source WHERE name = 'DATABASE'),
        'spi',
        'SPI Migration',
        'spi',
        'default',
        NOW()::date
    );

    -- Create table if not exists public.migrate_spi_user_deduplication
  CREATE TABLE IF NOT EXISTS public.migrate_spi_user_deduplication (
      id              BIGSERIAL PRIMARY KEY,
      given_name      VARCHAR(255) NOT NULL,
      family_name     VARCHAR(255) NOT NULL,
      display_name    VARCHAR(512) NOT NULL,
      when_created    DATE,
      when_updated    DATE,
      spi_project_ids INTEGER[] CHECK (cardinality(spi_project_ids) > 0),
      spi_person_ids  INTEGER[] CHECK (cardinality(spi_person_ids) > 0),
      biohub_user_id  INTEGER NULL REFERENCES biohub.system_user(system_user_id) ON DELETE SET NULL ON UPDATE CASCADE DEFAULT NULL,
      CONSTRAINT dedup UNIQUE (family_name, given_name)
  );
    
    ----------------------------------------------------------------------------------------
    -- Schema changes for the SPI data migration
    ----------------------------------------------------------------------------------------
    -- Adding a new column for mapping SIMS Projects to SPI Projects
    ALTER TABLE project
    ADD COLUMN spi_project_id INTEGER NULL;

    -- Adding a new column temporarily for legacy SPI data migration, mapping spi taxon IDs to ITIS tsns
    ALTER TABLE study_species
    ADD COLUMN spi_wldtaxonomic_units_id INTEGER;

    -- Adding a new column for mapping SIMS Surveys to SPI Surveys
    ALTER TABLE survey
    ADD COLUMN spi_survey_id INTEGER NULL;

    -- Adding a new column in study_species to indicate if the data was imported from SPI
    ALTER TABLE study_species
    ADD COLUMN is_spi_import BOOLEAN NOT NULL DEFAULT FALSE;

    
    ----------------------------------------------------------------------------------------
    -- Functions and triggers
    ----------------------------------------------------------------------------------------
    -- Create or replace function public.migrate_populate_project_ids()
    CREATE OR REPLACE FUNCTION public.migrate_populate_project_ids()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $function$
    BEGIN
        NEW.spi_project_ids := ARRAY(
            SELECT spi_project_id
            FROM spi_persons
            WHERE person_id = ANY (NEW.spi_person_ids)
        );
        RETURN NEW;
    END
    $function$;

    -- Create or replace trigger populate_project_ids
    CREATE OR REPLACE TRIGGER populate_project_ids
    AFTER INSERT OR UPDATE
    ON public.migrate_spi_user_deduplication
    FOR EACH ROW
    EXECUTE FUNCTION public.migrate_populate_project_ids();

    DROP TRIGGER IF EXISTS populate_project_ids ON biohub.migrate_spi_user_deduplication;
    DROP FUNCTION IF EXISTS biohub.migrate_populate_project_ids();
    ALTER TABLE biohub.project DROP COLUMN IF EXISTS spi_project_id;
    ALTER TABLE biohub.study_species DROP COLUMN IF EXISTS spi_wldtaxonomic_units_id;
    ALTER TABLE biohub.survey DROP COLUMN IF EXISTS spi_survey_id;
    ALTER TABLE biohub.study_species DROP COLUMN IF EXISTS is_spi_import;
    DROP TABLE IF EXISTS biohub.migrate_spi_user_deduplication;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}