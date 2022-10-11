import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Add spatial transform
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA}, ${DB_SCHEMA_DAPI_V1};

    -- inserting new submission status types

    
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to Get Occurrence Submission', now(), 'Validation failed on getting the occurrence submission');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to get file from S3', now(), 'Validation failed on getting the file from S3');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to parse submission', now(), 'Validation failed on parsing the submission');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to prep DarwinCore Archive', now(), 'Transformation failed on preparing the Darwin Core Archive file');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to prep XLSX', now(), 'Transformation failed on preparing the XLSX file');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to persist parse errors', now(), 'Validation failed on persisting the parse errors');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to get validation rules', now(), 'Validation failed on getting the validation rules');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to get transformation rules', now(), 'Transformation failed on getting the transformation rules');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to persist transformation results', now(), 'Transformation failed on persisting the transformation results');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to transform XLSX', now(), 'Transformation failed on transforming the XLSX file');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to validate DarwinCore Archive', now(), 'Validation failed on validating Darwin Core Archive');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to persist validation results', now(), 'Validation failed on persisting validation results');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to update occurrence submission', now(), 'Process failed on updating occurrence submission');
    insert into submission_status_type (name, record_effective_date, description) values ('Media it not valid', now(), 'Media it not valid');


    -- inserting new submission message types
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Error', now(), 'An error has occurred', (select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Parse error', now(), 'A parse error has occurred', (select submission_message_class_id from submission_message_class where name = 'Error'));
  `);
}

/**
 * Not used.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
