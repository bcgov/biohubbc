import { Knex } from 'knex';

/**
 * Makes the lead biologist properties on a survey nullable, since the app no longer supports
 * entering or editing biologists.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    ALTER TABLE survey
    ALTER COLUMN lead_first_name       DROP NOT NULL,
    ALTER COLUMN lead_last_name        DROP NOT NULL;

    COMMENT ON COLUMN survey.lead_first_name IS '(Deprecated) The first name of the person who is the lead for the survey.';
    COMMENT ON COLUMN survey.lead_last_name IS '(Deprecated) The last name of the person who is the lead for the survey.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
