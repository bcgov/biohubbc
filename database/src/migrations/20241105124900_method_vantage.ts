import { Knex } from 'knex';

/**
 * - Adds a category_id to method attributes
 * - Makes attribute options reusable
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Add lookup table for reusable attribute answers
    ----------------------------------------------------------------------------------------

    CREATE TABLE technique_attribute_qualitative_option (
        technique_attribute_qualitative_option_id      integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                                           varchar(50)       NOT NULL,
        record_effective_date                          date              DEFAULT now() NOT NULL,
        description                                    varchar(3000),
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT technique_attribute_qualitative_option_pk PRIMARY KEY (technique_attribute_qualitative_option_id)
    );

    -------------------------------------------------------------------------
    -- Create audit and journal triggers
    -------------------------------------------------------------------------
    
    CREATE TRIGGER audit_technique_attribute_qualitative_option BEFORE INSERT OR UPDATE OR DELETE ON technique_attribute_qualitative_option for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_technique_attribute_qualitative_option AFTER INSERT OR UPDATE OR DELETE ON technique_attribute_qualitative_option for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    --------------------------------------------------------------------------------------------------------------
    -- Update method lookup qualitative option table to reference new reusable option table
    --------------------------------------------------------------------------------------------------------------

    -- foreign key
    ALTER TABLE method_lookup_attribute_qualitative_option
    ADD COLUMN technique_attribute_qualitative_option_id INTEGER;

    -- foreign key constraint
    ALTER TABLE method_lookup_attribute_qualitative_option ADD CONSTRAINT method_lookup_attribute_qualitative_option_fk2 FOREIGN KEY (technique_attribute_qualitative_option_id)
    REFERENCES technique_attribute_qualitative_option (technique_attribute_qualitative_option_id);

    -- foreign key index
    CREATE INDEX method_lookup_attribute_qualitative_option_idx2 ON method_lookup_attribute_qualitative_option(method_lookup_attribute_qualitative_option_id);
    
    -- Add unique end-date key constraint (don't allow 2 entities with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX technique_attribute_qualitative_option_nuk1 ON technique_attribute_qualitative_option(name, description, (record_end_date is NULL)) where record_end_date is null;


    ----------------------------------------------------------------------------------------
    -- Insert existing data into new reusable option table
    ----------------------------------------------------------------------------------------

    WITH w_insert AS (
        INSERT INTO technique_attribute_qualitative_option (name, description)
        SELECT DISTINCT name, description
        FROM method_lookup_attribute_qualitative_option mla
        RETURNING name, description, technique_attribute_qualitative_option_id
    )
    UPDATE method_lookup_attribute_qualitative_option
    SET technique_attribute_qualitative_option_id = w_insert.technique_attribute_qualitative_option_id
    FROM w_insert
    WHERE method_lookup_attribute_qualitative_option.name = w_insert.name
    AND method_lookup_attribute_qualitative_option.description = w_insert.description;
    
    -- add NOT NULL constraint    
    -- ALTER TABLE method_lookup_attribute_qualitative_option ALTER COLUMN technique_attribute_qualitative_option_id SET NOT NULL;

    ----------------------------------------------------------------------------------------
    -- Comments
    ----------------------------------------------------------------------------------------
    
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.technique_attribute_qualitative_option_id IS 'Foreign key to a technique attribute option.';

    COMMENT ON COLUMN technique_attribute_qualitative_option.technique_attribute_qualitative_option_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.name IS 'The name of the record.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.description IS 'The description of the record.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN technique_attribute_qualitative_option.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE technique_attribute_qualitative_option IS 'Options to be selected for a technique_attribute_qualitative record, representing values for categorical attributes.';

    ----------------------------------------------------------------------------------------
    -- Add table with categories for attributes
    ----------------------------------------------------------------------------------------

    CREATE TABLE method_lookup_attribute_category (
        method_lookup_attribute_category_id            integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                                           varchar(50)       NOT NULL,
        description                                    varchar(1000),
        record_effective_date                          date              DEFAULT now() NOT NULL,
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT method_lookup_attribute_category_pk PRIMARY KEY (method_lookup_attribute_category_id)
    );

    -------------------------------------------------------------------------
    -- Create audit and journal triggers
    -------------------------------------------------------------------------
    
    CREATE TRIGGER audit_method_lookup_attribute_category BEFORE INSERT OR UPDATE OR DELETE ON method_lookup_attribute_category for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_lookup_attribute_category AFTER INSERT OR UPDATE OR DELETE ON method_lookup_attribute_category for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    --------------------------------------------------------------------------------------------------------------
    -- Update method lookup qualitative option table to reference new reusable option table
    --------------------------------------------------------------------------------------------------------------

    -- foreign key, without NOT NULL until values are inserted
    ALTER TABLE method_lookup_attribute_qualitative ADD COLUMN method_lookup_attribute_category_id INTEGER;

    -- foreign key constraint
    ALTER TABLE method_lookup_attribute_qualitative ADD CONSTRAINT method_lookup_attribute_qualitative_fk3 FOREIGN KEY (method_lookup_attribute_category_id)
    REFERENCES method_lookup_attribute_category(method_lookup_attribute_category_id);

    -- foreign key index
    CREATE INDEX method_lookup_attribute_qualitative_idx3 ON method_lookup_attribute_category(method_lookup_attribute_category_id);
        
    -- Add unique end-date key constraint (don't allow 2 entities with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX method_lookup_attribute_category_nuk1 ON method_lookup_attribute_category(name, (record_end_date is NULL)) where record_end_date is null;


    -------------------------------------------------------------------------
    -- Insert initial attribute category values
    -------------------------------------------------------------------------

    INSERT INTO method_lookup_attribute_category (name, description) VALUES ('detail', 'Provides additional detail about how a method was implemented.');

    --------------------------------------------------------------------------------------------------------------
    -- Assign categories to existing attributes
    --------------------------------------------------------------------------------------------------------------

    UPDATE method_lookup_attribute_qualitative 
    SET method_lookup_attribute_category_id = mlac.method_lookup_attribute_category_id
    FROM method_lookup_attribute_category mlac
    WHERE mlac.name = 'detail';

    -- add NOT NULL constraint    
    ALTER TABLE method_lookup_attribute_qualitative ALTER COLUMN method_lookup_attribute_category_id SET NOT NULL;

    
    ----------------------------------------------------------------------------------------
    -- Comments
    ----------------------------------------------------------------------------------------
    
    COMMENT ON COLUMN method_lookup_attribute_qualitative.method_lookup_attribute_category_id IS 'Foreign key to a technique attribute option.';

    COMMENT ON COLUMN method_lookup_attribute_category.method_lookup_attribute_category_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_lookup_attribute_category.name IS 'The name of the record.';
    COMMENT ON COLUMN method_lookup_attribute_category.description IS 'The description of the record.';
    COMMENT ON COLUMN method_lookup_attribute_category.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN method_lookup_attribute_category.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_lookup_attribute_category.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_lookup_attribute_category.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_lookup_attribute_category.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_lookup_attribute_category.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE method_lookup_attribute_category IS 'Options to be selected for a technique_attribute_qualitative record, representing values for categorical attributes.';

    ----------------------------------------------------------------------------------------
    -- Views
    ----------------------------------------------------------------------------------------
    
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW technique_attribute_qualitative_option AS SELECT * FROM biohub.technique_attribute_qualitative_option;
    CREATE OR REPLACE VIEW method_lookup_attribute_qualitative_option AS SELECT * FROM biohub.method_lookup_attribute_qualitative_option;
    CREATE OR REPLACE VIEW method_lookup_attribute_qualitative AS SELECT * FROM biohub.method_lookup_attribute_qualitative;
    CREATE OR REPLACE VIEW method_lookup_attribute_category AS SELECT * FROM biohub.method_lookup_attribute_category;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
