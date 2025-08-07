import { Knex } from 'knex';

/**
 * Adding an option for invited admin status
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=biohub;

    ----------------------------------------------------------------------------------------
    -- Invited status for administrative activities
    ----------------------------------------------------------------------------------------

    INSERT INTO administrative_activity_status_type (name, record_effective_date, description) 
VALUES ('Invited', now(), 'User has been invited via email but has not yet requested access');

    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
