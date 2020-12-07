import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    CREATE TABLE ${DB_SCHEMA}.template ();
    COMMENT ON TABLE ${DB_SCHEMA}.template IS 'Stores form template information. Includes the data template, which defines the data collected by the form, and the ui template, which defines the ui widget used for each field.';

    ALTER TABLE ${DB_SCHEMA}.template ADD COLUMN template_id SERIAL PRIMARY KEY;
    COMMENT ON COLUMN ${DB_SCHEMA}.template.template_id IS 'Auto generated primary key';

    ALTER TABLE ${DB_SCHEMA}.template ADD COLUMN tags text[];
    COMMENT ON COLUMN ${DB_SCHEMA}.template.tags IS 'Array of keywords used to help categorize this template';

    ALTER TABLE ${DB_SCHEMA}.template ADD COLUMN name VARCHAR(100) NULL;
    COMMENT ON COLUMN ${DB_SCHEMA}.template.name IS 'Name of this template';

    ALTER TABLE ${DB_SCHEMA}.template ADD COLUMN description VARCHAR(500) NULL;
    COMMENT ON COLUMN ${DB_SCHEMA}.template.description IS 'Description of this template';

    ALTER TABLE ${DB_SCHEMA}.template ADD COLUMN data_template JSONB;
    COMMENT ON COLUMN ${DB_SCHEMA}.template.data_template IS 'Form data template. Defines the data collected by the form, as well as any initial attributes and constraints.';

    ALTER TABLE ${DB_SCHEMA}.template ADD COLUMN ui_template JSONB;
    COMMENT ON COLUMN ${DB_SCHEMA}.template.ui_template IS 'Form ui template. Defines the ui widgets that each field in the data template will use when rendering, as well as any initial ui related attributes and constraints.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP TABLE IF EXISTS ${DB_SCHEMA}.template;
  `);
}
