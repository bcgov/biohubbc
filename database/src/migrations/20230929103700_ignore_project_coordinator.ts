import { Knex } from 'knex';

/**
 * Makes the Project Coordinator properties on a project nullable, since the app no longer supports
 * entering or editing project coorindators
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    ALTER TABLE project
    ALTER COLUMN coordinator_first_name       DROP NOT NULL;
    ALTER COLUMN coordinator_last_name        DROP NOT NULL;
    ALTER COLUMN coordinator_email_address    DROP NOT NULL;
    ALTER COLUMN coordinator_agency_name      DROP NOT NULL;
    ALTER COLUMN coordinator_public           DROP NOT NULL;  
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
