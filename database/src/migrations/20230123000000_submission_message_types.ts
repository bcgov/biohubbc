import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

const submissionMessageTypes = [
  {
    name: 'Mismatched template with survey focal species',
    description:
      'The species associated with the template does not match the focal species associated with this survey.',
    class: 'Error'
  }
];

/**
 * Add new submission message types.
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

  for (const message of submissionMessageTypes) {
    await knex.raw(`
      INSERT INTO
        ${DB_SCHEMA}.submission_message_type (name, record_effective_date, description, submission_message_class_id)
      VALUES (
        '${message.name}', now(), '${message.description}', (
          SELECT
            submission_message_class_id
          FROM
            submission_message_class
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
