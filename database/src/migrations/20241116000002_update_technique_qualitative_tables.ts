import { Knex } from 'knex';

/**
 * UPDATES TO EXISTING CONCEPTS:
 *
 * - Adds a table for storing options for qualitative attributes of techniques, making the options reusable
 * - (ie. avoid duplicate records for qualitative attributes with the same options)
 *
 * - eg. If camera trap and dip net both have a "material" attribute with "plastic" as an option, there should be one "plastic" record that gets reused.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- DROP EXISTING VIEW
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    -- Drop view to allow name and description column to be deleted
    DROP VIEW IF EXISTS method_lookup_attribute_qualitative_option;

    ----------------------------------------------------------------------------------------
    -- CREATE NEW TABLE
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    CREATE TABLE technique_attribute_qualitative_option (
        technique_attribute_qualitative_option_id      integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                                           varchar(50)       NOT NULL,
        description                                    varchar(3000),
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT technique_attribute_qualitative_option_pk PRIMARY KEY (technique_attribute_qualitative_option_id)
    );

    COMMENT ON TABLE technique_attribute_qualitative_option IS 'Options to be selected for a technique_attribute_qualitative record, representing values for categorical attributes.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.technique_attribute_qualitative_option_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.name IS 'The name of the record.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.description IS 'The description of the record.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.revision_count IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint (don't allow 2 records with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX technique_attribute_qualitative_option_nuk1 ON technique_attribute_qualitative_option(name, (record_end_date is NULL)) where record_end_date is null;

    -- Add audit/journal triggers
    CREATE TRIGGER audit_technique_attribute_qualitative_option BEFORE INSERT OR UPDATE OR DELETE ON technique_attribute_qualitative_option for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_technique_attribute_qualitative_option AFTER INSERT OR UPDATE OR DELETE ON technique_attribute_qualitative_option for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- ADD COLUMN TO EXISTING TABLE
    ----------------------------------------------------------------------------------------

    CREATE INDEX method_lookup_attribute_qualitative_option_idx2 ON method_lookup_attribute_qualitative_option(method_lookup_attribute_qualitative_option_id);

    -- Alter the qualitative options table to include a reference to the new table

    -- Add new column
    ALTER TABLE method_lookup_attribute_qualitative_option ADD COLUMN technique_attribute_qualitative_option_id INTEGER;

    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.technique_attribute_qualitative_option_id IS 'Foreign key to a technique attribute option.';

    -- Add foreign key constraint
    ALTER TABLE method_lookup_attribute_qualitative_option ADD CONSTRAINT method_lookup_attribute_qualitative_option_fk2
      FOREIGN KEY (technique_attribute_qualitative_option_id)
      REFERENCES technique_attribute_qualitative_option(technique_attribute_qualitative_option_id);

    -- add indexes for foreign keys
    CREATE INDEX method_lookup_attribute_qualitative_option_idx3 ON method_lookup_attribute_qualitative_option(technique_attribute_qualitative_option_id);

    ----------------------------------------------------------------------------------------
    -- MIGRATE EXISTING DATA
    ----------------------------------------------------------------------------------------

    -- Populate new table from existing options
    WITH w_insert AS (
      INSERT INTO technique_attribute_qualitative_option (name, description)
      SELECT name, description
      FROM (
          SELECT name, description,
                ROW_NUMBER() OVER (PARTITION BY name ORDER BY description) AS rn
          FROM method_lookup_attribute_qualitative_option mla
      ) subquery
      WHERE rn = 1
      RETURNING name, description, technique_attribute_qualitative_option_id
    )
    UPDATE method_lookup_attribute_qualitative_option
    SET technique_attribute_qualitative_option_id = w_insert.technique_attribute_qualitative_option_id
    FROM w_insert
    WHERE method_lookup_attribute_qualitative_option.name = w_insert.name;

    -- Add not null constraints and drop name and description, which are replaced with the foreign key reference to technique_attribute_qualitative_option
    ALTER TABLE method_lookup_attribute_qualitative_option ALTER COLUMN technique_attribute_qualitative_option_id SET NOT NULL;

    ALTER TABLE method_lookup_attribute_qualitative_option DROP COLUMN name;
    ALTER TABLE method_lookup_attribute_qualitative_option DROP COLUMN description;

    ----------------------------------------------------------------------------------------
    -- ADD/UPDATE VIEWS
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW technique_attribute_qualitative_option AS SELECT * FROM biohub.technique_attribute_qualitative_option;
    CREATE OR REPLACE VIEW method_lookup_attribute_qualitative_option AS SELECT * FROM biohub.method_lookup_attribute_qualitative_option;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
