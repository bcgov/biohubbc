import { Knex } from 'knex';

/**
 *  add crew member and crew lead
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Adding survey participant roles
    ----------------------------------------------------------------------------------------
        INSERT INTO survey_job (name, record_effective_date, description)
        VALUES
          ('Crew lead', NOW(), 'A participant of a survey in a crew lead role.'),
          ('Crew member', NOW(), 'A participant of a survey in a crew member role.');

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
