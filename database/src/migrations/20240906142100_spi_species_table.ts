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
    SET SEARCH_PATH=public;

    ----------------------------------------------------------------------------------------
    -- Table that the SPI ETL scripts insert into, for mapping SPI species codes to ITIS TSNs
    ----------------------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS public.migrate_spi_species (
        id                      integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        spi_species_id          INTEGER NOT NULL,
        spi_species_code        VARCHAR(16),
        spi_scientific_name     VARCHAR(128),
        spi_rank                VARCHAR(24),
        itis_tsn                VARCHAR(16),
        itis_scientific_name    VARCHAR(128),
        itis_rank               VARCHAR(24),
        CONSTRAINT itis_tsn_uk UNIQUE (itis_tsn),
        CONSTRAINT spi_species_id_uk UNIQUE (spi_species_id)
    );
    `);
    }

    export async function down(knex: Knex): Promise<void> {
    await knex.raw(``);
    }
