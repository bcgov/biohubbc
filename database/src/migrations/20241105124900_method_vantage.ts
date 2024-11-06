import { Knex } from 'knex';

/**
 * UPDATES TO EXISTING CONCEPTS:
 * 
 * - Adds a table for storing options for qualitative attributes of techniques, making the options reusable 
 * - (ie. avoid duplicate options for attributes with the same options) 
 * 
 * - eg. If camera trap and dip net both have a "material" attribute with "plastic" as an option, there should be one "plastic" record that gets reused.
 * 
 * NEW CONCEPT: Vantage
 * 
 * - Adds tables for vantage and vantage modes
 * - Alters technique table to include reference to a vantage mode
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- UPDATE TECHNIQUE ATTRIBUTE TABLES TO REUSE QUALITATIVE OPTIONS
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
    
    CREATE TRIGGER audit_technique_attribute_qualitative_option BEFORE INSERT OR UPDATE OR DELETE ON technique_attribute_qualitative_option for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_technique_attribute_qualitative_option AFTER INSERT OR UPDATE OR DELETE ON technique_attribute_qualitative_option for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    ALTER TABLE method_lookup_attribute_qualitative_option ADD COLUMN technique_attribute_qualitative_option_id INTEGER;

    ALTER TABLE method_lookup_attribute_qualitative_option ADD CONSTRAINT method_lookup_attribute_qualitative_option_fk2 FOREIGN KEY (technique_attribute_qualitative_option_id)
    REFERENCES technique_attribute_qualitative_option (technique_attribute_qualitative_option_id);

    CREATE INDEX method_lookup_attribute_qualitative_option_idx2 ON method_lookup_attribute_qualitative_option(method_lookup_attribute_qualitative_option_id);
    
    CREATE UNIQUE INDEX technique_attribute_qualitative_option_nuk1 ON technique_attribute_qualitative_option(name, description, (record_end_date is NULL)) where record_end_date is null;
        
    COMMENT ON COLUMN method_lookup_attribute_qualitative_option.technique_attribute_qualitative_option_id IS 'Foreign key to a technique attribute option.';

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
    
    ALTER TABLE method_lookup_attribute_qualitative_option ALTER COLUMN technique_attribute_qualitative_option_id SET NOT NULL;

    ALTER TABLE method_lookup_attribute_qualitative_option DROP COLUMN name;
    ALTER TABLE method_lookup_attribute_qualitative_option DROP COLUMN description;


    ----------------------------------------------------------------------------------------
    -- ADD NEW VANTAGE TABLES
    ----------------------------------------------------------------------------------------

    CREATE TABLE vantage (
        vantage_id                                     integer                        GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                                           varchar(50)       NOT NULL,
        description                                    varchar(1000),
        record_effective_date                          date              DEFAULT now() NOT NULL,
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT vantage_pk PRIMARY KEY (vantage_id)
    );
        
    CREATE UNIQUE INDEX vantage_nuk1 ON vantage(name, description, (record_end_date is NULL)) where record_end_date is null;

    CREATE TRIGGER audit_vantage BEFORE INSERT OR UPDATE OR DELETE ON vantage for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_vantage AFTER INSERT OR UPDATE OR DELETE ON vantage for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    COMMENT ON TABLE vantage IS 'Vantages that vantage modes can belong to, like categories of modes.';
    COMMENT ON COLUMN vantage.vantage_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN vantage.name IS 'The name of the record.';
    COMMENT ON COLUMN vantage.description IS 'The description of the record.';
    COMMENT ON COLUMN vantage.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN vantage.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN vantage.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN vantage.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN vantage.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN vantage.revision_count IS 'Revision count used for concurrency control.';

    -------

    CREATE TABLE vantage_mode (
        vantage_mode_id                                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        vantage_id                                     integer           NOT NULL,
        name                                           varchar(50)       NOT NULL,
        description                                    varchar(1000),
        record_effective_date                          date              DEFAULT now() NOT NULL,
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT vantage_mode_pk PRIMARY KEY (vantage_mode_id)
    );

    ALTER TABLE vantage_mode ADD CONSTRAINT vantage_mode_fk1 FOREIGN KEY (vantage_id) REFERENCES vantage (vantage_id);

    CREATE INDEX vantage_mode_idx1 ON vantage_mode (vantage_id);

    CREATE UNIQUE INDEX vantage_mode_nuk1 ON vantage_mode (vantage_id, name, (record_end_date is NULL)) where record_end_date is null;

    CREATE TRIGGER audit_vantage_mode BEFORE INSERT OR UPDATE OR DELETE ON vantage_mode for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_vantage_mode AFTER INSERT OR UPDATE OR DELETE ON vantage_mode for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    COMMENT ON TABLE vantage_mode IS 'Vantage mode options that can be applied to techniques.';
    COMMENT ON COLUMN vantage_mode.vantage_mode_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN vantage_mode.vantage_id IS 'The vantage option of the record.';
    COMMENT ON COLUMN vantage_mode.name IS 'The name of the record.';
    COMMENT ON COLUMN vantage_mode.description IS 'The description of the record.';
    COMMENT ON COLUMN vantage_mode.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN vantage_mode.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN vantage_mode.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_mode.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN vantage_mode.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_mode.revision_count IS 'Revision count used for concurrency control.';

    -------

    CREATE TABLE vantage_mode_method (
        vantage_mode_method_id                         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        vantage_mode_id                                integer           NOT NULL,
        method_lookup_id                               integer           NOT NULL,
        description                                    varchar(1000),
        record_effective_date                          date              DEFAULT now() NOT NULL,
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT vantage_mode_method_pk PRIMARY KEY (vantage_mode_method_id)
    );

    ALTER TABLE vantage_mode_method ADD CONSTRAINT vantage_mode_method_fk1 FOREIGN KEY (method_lookup_id) REFERENCES method_lookup (method_lookup_id);
    ALTER TABLE vantage_mode_method ADD CONSTRAINT vantage_mode_method_fk2 FOREIGN KEY (vantage_mode_id) REFERENCES vantage_mode (vantage_mode_id);

    CREATE INDEX vantage_mode_method_idx1 ON vantage_mode_method (method_lookup_id);
    CREATE INDEX vantage_mode_method_idx2 ON vantage_mode_method (vantage_mode_id);

    CREATE UNIQUE INDEX vantage_mode_method_nuk1 ON vantage_mode_method (vantage_mode_id, method_lookup_id, (record_end_date is NULL)) where record_end_date is null;

    CREATE TRIGGER audit_vantage_mode_method BEFORE INSERT OR UPDATE OR DELETE ON vantage_mode_method for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_vantage_mode_method AFTER INSERT OR UPDATE OR DELETE ON vantage_mode_method for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    COMMENT ON TABLE vantage_mode_method IS 'Join table indicating which vantage modes apply to which method lookup options.';
    COMMENT ON COLUMN vantage_mode_method.vantage_mode_method_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN vantage_mode_method.vantage_mode_id IS 'The vantage mode option of the record.';
    COMMENT ON COLUMN vantage_mode_method.method_lookup_id IS 'The method lookup option of the record.';
    COMMENT ON COLUMN vantage_mode_method.description IS 'The description of the record.';
    COMMENT ON COLUMN vantage_mode_method.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN vantage_mode_method.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN vantage_mode_method.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_mode_method.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN vantage_mode_method.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_mode_method.revision_count IS 'Revision count used for concurrency control.';

    -------

    CREATE TABLE method_technique_vantage_mode (
        method_technique_vantage_mode_id               integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        method_technique_id                            integer           NOT NULL,
        vantage_mode_method_id                         integer           NOT NULL,
        description                                    varchar(1000),
        record_effective_date                          date              DEFAULT now() NOT NULL,
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT method_technique_vantage_mode_pk PRIMARY KEY (method_technique_vantage_mode_id)
    );

    ALTER TABLE method_technique_vantage_mode ADD CONSTRAINT method_technique_vantage_mode_fk1 FOREIGN KEY (method_technique_id) REFERENCES method_technique (method_technique_id);
    ALTER TABLE method_technique_vantage_mode ADD CONSTRAINT method_technique_vantage_mode_fk2 FOREIGN KEY (vantage_mode_method_id) REFERENCES vantage_mode_method (vantage_mode_method_id);

    CREATE INDEX method_technique_vantage_mode_idx1 ON method_technique_vantage_mode (method_technique_id);
    CREATE INDEX method_technique_vantage_mode_idx2 ON method_technique_vantage_mode (vantage_mode_method_id);

    CREATE UNIQUE INDEX method_technique_vantage_mode_nuk1 ON method_technique_vantage_mode (method_technique_id, vantage_mode_method_id);

    CREATE TRIGGER audit_method_technique_vantage_mode BEFORE INSERT OR UPDATE OR DELETE ON method_technique_vantage_mode for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_technique_vantage_mode AFTER INSERT OR UPDATE OR DELETE ON method_technique_vantage_mode for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    COMMENT ON TABLE method_technique_vantage_mode IS 'Join table indicating which vantage modes apply to which method lookup options.';
    COMMENT ON COLUMN method_technique_vantage_mode.method_technique_vantage_mode_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_technique_vantage_mode.method_technique_id IS 'The method technique of the record.';
    COMMENT ON COLUMN method_technique_vantage_mode.vantage_mode_method_id IS 'The vantage mode of the record.';
    COMMENT ON COLUMN method_technique_vantage_mode.description IS 'The description of the record.';
    COMMENT ON COLUMN method_technique_vantage_mode.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN method_technique_vantage_mode.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_technique_vantage_mode.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_vantage_mode.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_technique_vantage_mode.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_vantage_mode.revision_count IS 'Revision count used for concurrency control.';


    ----------------------------------------------------------------------------------------
    -- Insert initial values
    ----------------------------------------------------------------------------------------

    INSERT INTO 
      vantage (name, description) 
    VALUES 
      ('air', 'Aerial view from an aircraft or drone.'),
      ('arboreal', 'View from the tree canopy.'),
      ('water', 'View from a body of water.'),
      ('benthic', 'View from the bottom of a waterbody.'),
      ('ground', 'View from the ground.');

    INSERT INTO 
      vantage_mode (vantage_id, name, description) 
    VALUES 
      -- Air Vantage Modes
      ((SELECT vantage_id FROM vantage WHERE name = 'air'), 'helicopter', 'View from a helicopter.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'air'), 'plane', 'View from a plane.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'air'), 'drone', 'View from a drone.'),
      
      -- Arboreal Vantage Modes
      ((SELECT vantage_id FROM vantage WHERE name = 'arboreal'), 'stationary fixture', 'View from a stationary fixture in the tree canopy.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'arboreal'), 'climbing', 'View from climbing in the tree canopy.'),
      
      -- Water Vantage Modes
      ((SELECT vantage_id FROM vantage WHERE name = 'water'), 'stationary fixture', 'At a fixed position in or under the water.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'water'), 'boat', 'View from a boat or canoe.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'water'), 'kayak or canoe', 'View from a kayak or canoe.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'water'), 'submersible', 'View from an underwater submersible.'),
      
      -- Ground Vantage Modes
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'stationary fixture', 'At a fixed position on the ground.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'foot', 'On foot.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'vehicle', 'In a truck, car, or similar vehicle.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'quad', 'On a quad or all-terrain vehicle.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'horseback', 'On horseback.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'snowmobile', 'On a snowmobile.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'bike', 'On a bicycle'),

      -- Benthic Vantage Modes
      ((SELECT vantage_id FROM vantage WHERE name = 'benthic'), 'stationary fixture', 'At a fixed position on the bottom of a waterbody.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'benthic'), 'submersible', 'View from a submersible on the bottom of a waterbody.');

    INSERT INTO 
      vantage_mode_method (method_lookup_id, vantage_mode_id)
    VALUES 
      -- Visual Encounter Method
      -- Air Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'helicopter' AND v.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'plane' AND v.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'drone' AND v.name = 'air')),

      -- Arboreal Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'stationary fixture' AND v.name = 'arboreal')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'climbing' AND v.name = 'arboreal')),

      -- Water Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'boat' AND v.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'kayak or canoe' AND v.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'submersible' AND v.name = 'water')),

      -- Ground Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'foot' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'vehicle' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'quad' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'horseback' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'snowmobile' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'bike' AND v.name = 'ground')),

      -- Audio Encounter Method
      -- Air Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'helicopter' AND v.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'plane' AND v.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'drone' AND v.name = 'air')),

      -- Arboreal Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'stationary fixture' AND v.name = 'arboreal')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'climbing' AND v.name = 'arboreal')),

      -- Water Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'boat' AND v.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'kayak or canoe' AND v.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'submersible' AND v.name = 'water')),

      -- Ground Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'foot' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'vehicle' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'quad' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'horseback' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'snowmobile' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'bike' AND v.name = 'ground')),

      -- Radar Method
      -- Air Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'helicopter' AND v.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'plane' AND v.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'drone' AND v.name = 'air')),

      -- Ground Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'foot' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'vehicle' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'stationary fixture' AND v.name = 'ground')),

      -- Water Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'boat' AND v.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'kayak or canoe' AND v.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'submersible' AND v.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'), 
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'stationary fixture' AND v.name = 'water'));


    ----------------------------------------------------------------------------------------
    -- Views
    ----------------------------------------------------------------------------------------
    
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW technique_attribute_qualitative_option AS SELECT * FROM biohub.technique_attribute_qualitative_option;
    CREATE OR REPLACE VIEW method_lookup_attribute_qualitative_option AS SELECT * FROM biohub.method_lookup_attribute_qualitative_option;
    CREATE OR REPLACE VIEW vantage AS SELECT * FROM biohub.vantage;
    CREATE OR REPLACE VIEW vantage_mode AS SELECT * FROM biohub.vantage_mode;
    CREATE OR REPLACE VIEW vantage_mode_method AS SELECT * FROM biohub.vantage_mode_method;
    CREATE OR REPLACE VIEW method_technique AS SELECT * FROM biohub.method_technique;
    CREATE OR REPLACE VIEW method_technique_vantage_mode AS SELECT * FROM biohub.method_technique_vantage_mode;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
