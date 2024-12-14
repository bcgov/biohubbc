import { Knex } from 'knex';

/**
 * Migration to rename the "vantage" table to "vantage_mode_category"
 * and rename its primary key column "vantage_id" to "vantage_mode_category_id".
 * It also updates the foreign key references in related tables using raw SQL.
 *
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

    DROP VIEW biohub_dapi_v1.vantage;
    DROP VIEW biohub_dapi_v1.vantage_mode;

    SET SEARCH_PATH = biohub;

    ----------------------------------------------------------------------------------------
    -- RENAME VANTAGE TO VANTAGE_MODE_CATEGORY
    ----------------------------------------------------------------------------------------
    
    ALTER TABLE vantage RENAME COLUMN vantage_id TO vantage_mode_category_id;
    ALTER TABLE vantage RENAME TO vantage_mode_category;
    ALTER TABLE vantage_mode RENAME COLUMN vantage_id TO vantage_mode_category_id;

    ----------------------------------------------------------------------------------------
    -- UPDATE FOREIGN KEYS
    ----------------------------------------------------------------------------------------

    ALTER TABLE vantage_mode DROP CONSTRAINT vantage_mode_fk1;

    ALTER TABLE vantage_mode ADD CONSTRAINT vantage_mode_fk1
        FOREIGN KEY (vantage_mode_category_id)
        REFERENCES vantage_mode_category(vantage_mode_category_id);

    ----------------------------------------------------------------------------------------
    -- UPDATE INDEXES
    ----------------------------------------------------------------------------------------

    DROP INDEX IF EXISTS vantage_mode_idx1;
    DROP INDEX IF EXISTS vantage_mode_nuk1;

    -- indexes on vantage_mode
    CREATE UNIQUE INDEX vantage_mode_nuk1 ON vantage_mode(vantage_mode_category_id, name, (record_end_date is NULL)) where record_end_date is null;
    CREATE INDEX vantage_mode_idx1 ON vantage_mode(vantage_mode_category_id);
    
    ----------------------------------------------------------------------------------------
    -- UPDATE VIEWS
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH = biohub_dapi_v1;

    CREATE OR REPLACE VIEW vantage_mode_category AS SELECT * FROM biohub.vantage_mode_category;
    CREATE OR REPLACE VIEW vantage_mode AS SELECT * FROM biohub.vantage_mode;

  `);
}

export async function down(knex: Knex): Promise<void> {
}
