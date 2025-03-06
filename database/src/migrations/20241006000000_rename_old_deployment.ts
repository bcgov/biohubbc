import { Knex } from 'knex';

/**
 * Renames the existing deployment table to deployment_old to preserve the data while we migrate it to the new tables.
 *
 * Drops the old deployment table views, triggers, and constraints so the names can be re-usd by the new replacement
 * tables.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    -- Drop old deployment table view
    DROP VIEW IF EXISTS deployment;

    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    -- Drop old deployment table journal/audit triggers
    -- Note: the triggers were incorrectly named when originally created
    DROP TRIGGER IF EXISTS audit_critter ON deployment;
    DROP TRIGGER IF EXISTS journal_critter ON deployment;

    -- Drop old deployment table indexes
    DROP INDEX IF EXISTS deployment_uk1;
    DROP INDEX IF EXISTS deployment_idx1;
    
    -- Drop old deployment table constraints
    ALTER TABLE deployment DROP CONSTRAINT IF EXISTS deployment_fk1;
    ALTER TABLE deployment DROP CONSTRAINT IF EXISTS deployment_pk;

    -- Rename the existing deployment table to deployment_old to preserve the data while we migrate it to the new tables
    ALTER TABLE deployment RENAME TO deployment_old;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
