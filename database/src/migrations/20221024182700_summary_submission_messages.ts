import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

const summaryMessageTypes = [
	{ name: 'INVALID_MEDIA', description: 'Media is invalid.' },
  { name: 'INVALID_XLSX_CSV', description: 'Media is not a valid XLSX CSV file.' },
  { name: 'FAILED_TO_GET_TEMPLATE_NAME_VERSION', description: 'Missing name or version number.' },
  { name: 'FAILED_GET_VALIDATION_RULES', description: 'Failed to get validation rules.' },
  { name: 'UNSUPPORTED_FILE_TYPE', description: 'File submitted is not a supported type.' }
]

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
						SELECT summary_submission_message_class_id FROM summary_submission_message_class WHERE name = 'Error'
				)
			);
		`);
	}
}

export async function down(knex: Knex): Promise<void> {
	await knex.raw(``);
}
