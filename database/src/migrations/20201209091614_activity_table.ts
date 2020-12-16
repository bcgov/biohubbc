import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    CREATE TABLE ${DB_SCHEMA}.activity ();
    COMMENT ON TABLE ${DB_SCHEMA}.activity IS 'Stores activity information. Includes the id of the template used to create the form, and data captured by the form.';

    ALTER TABLE ${DB_SCHEMA}.activity ADD COLUMN activity_id SERIAL PRIMARY KEY;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity.activity_id IS 'Auto generated primary key';

    ALTER TABLE ${DB_SCHEMA}.activity ADD COLUMN tags text[];
    COMMENT ON COLUMN ${DB_SCHEMA}.activity.tags IS 'Array of keywords used to help categorize this activity';

    ALTER TABLE ${DB_SCHEMA}.activity ADD COLUMN template_id integer;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity.template_id IS 'Foreign key to template table';

    ALTER TABLE ${DB_SCHEMA}.activity ADD CONSTRAINT template_id_fkey FOREIGN KEY (template_id) REFERENCES ${DB_SCHEMA}.template (template_id);

    ALTER TABLE ${DB_SCHEMA}.activity ADD COLUMN form_data JSONB;
    COMMENT ON COLUMN ${DB_SCHEMA}.activity.form_data IS 'Data captured by the form';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP TABLE IF EXISTS ${DB_SCHEMA}.activity;
  `);
}
