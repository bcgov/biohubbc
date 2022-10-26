import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

const summaryMessageTypes = [
  {
      name: 'Media is Invalid',
      description: 'Media is invalid.',
      class: 'Error'
  },
  {
    name: 'XLSX CSV is Invalid',
    description: 'Media is not a valid XLSX CSV file.',
    class: 'Error'
  },
  {
    name: 'Missing Name or Version Number',
    description: 'Failed to get name or version number from XLSV custom properties.',
    class: 'Error'
  },
  {
    name: 'Failed to Get Validation Rules',
    description: 'Failed to get validation rules.',
    class: 'Error'
  },
  {
    name: 'Unsupported File Type',
    description: 'File submitted is not a supported type.',
    class: 'Error'
  },
  {
    name: 'Found Validation',
    description: 'Summary validation schema was found.',
    class: 'Notice'
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
