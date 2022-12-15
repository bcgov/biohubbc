import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

const summaryMessageTypes = [
  {
    name: 'Missing Child Key from Parent',
    description: 'Child sheet key missing from corresponding parent sheet column',
    class: 'Error'
  }
];

/**
 * Add new summary submission message types.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;
  `);

  for (const message of summaryMessageTypes) {
    await knex.raw(`
      INSERT INTO
        ${DB_SCHEMA}.summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id)
      VALUES (
        '${message.name}', now(), '${message.description}', (
          SELECT
            summary_submission_message_class_id
          FROM
            summary_submission_message_class
          WHERE
            name = '${message.class}'
        )
      );
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
