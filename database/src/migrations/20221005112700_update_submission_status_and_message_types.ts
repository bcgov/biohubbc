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


    insert into submission_status_type (name, record_effective_date, description) values ('Failed to prepare submission', now(), 'Validation failed on preparing the occurrence submission');
    insert into submission_status_type (name, record_effective_date, description) values ('Media is not valid', now(), 'Media it not valid');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to validate', now(), 'Failed to validate');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to transform', now(), 'Failed to transform');
    insert into submission_status_type (name, record_effective_date, description) values ('Failed to process occurrence data', now(), 'Failed to process occurrence data');


    -- inserting new submission message types
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to Get Occurrence Submission', now(), 'Validation failed on getting the occurrence submission',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to parse submission', now(), 'Validation failed on parsing the submission',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to prep DarwinCore Archive', now(), 'Transformation failed on preparing the Darwin Core Archive file',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to prep XLSX', now(), 'Transformation failed on preparing the XLSX file',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to persist parse errors', now(), 'Validation failed on persisting the parse errors',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to get validation rules', now(), 'Validation failed on getting the validation rules',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to get transformation rules', now(), 'Transformation failed on getting the transformation rules',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to persist transformation results', now(), 'Transformation failed on persisting the transformation results',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to transform XLSX', now(), 'Transformation failed on transforming the XLSX file',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to validate DarwinCore Archive', now(), 'Validation failed on validating Darwin Core Archive',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to persist validation results', now(), 'Validation failed on persisting validation results',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to update occurrence submission', now(), 'Process failed on updating occurrence submission',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Failed to get file from S3', now(), 'Failed to get file from S3',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Media is invalid', now(), 'Media is invalid',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Unable to get transform schema for submission', now(), 'Unable to get transform schema for submission',(select submission_message_class_id from submission_message_class where name = 'Error'));
    insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('File submitted is not a supported type', now(), 'File submitted is not a supported type',(select submission_message_class_id from submission_message_class where name = 'Error'));


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
