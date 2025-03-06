import { Knex } from 'knex';

/**
 * NEW CONCEPT: Vantage
 *
 * - Adds tables for vantage and vantage modes
 * - Adds a join table to assign vantage modes to method lookup options, setting which vantage modes can be used for a method lookup option
 * - Adds a join table to assign vantage modes to techniques
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- ADD NEW VANTAGE-RELATED TABLES
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    CREATE TABLE vantage (
        vantage_id                                     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                                           varchar(50)       NOT NULL,
        description                                    varchar(1000),
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT vantage_pk PRIMARY KEY (vantage_id)
    );

    COMMENT ON TABLE vantage IS 'Vantages that vantage_mode records belong to, like categories of modes.';
    COMMENT ON COLUMN vantage.vantage_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN vantage.name IS 'The name of the record.';
    COMMENT ON COLUMN vantage.description IS 'The description of the record.';
    COMMENT ON COLUMN vantage.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN vantage.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN vantage.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN vantage.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN vantage.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN vantage.revision_count IS 'Revision count used for concurrency control.';

    -- Triggers, indexes

    -- Add unique end-date key constraint (don't allow 2 records with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX vantage_nuk1 ON vantage(name, (record_end_date is NULL)) where record_end_date is null;

    -- Add audit/journal triggers
    CREATE TRIGGER audit_vantage BEFORE INSERT OR UPDATE OR DELETE ON vantage for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_vantage AFTER INSERT OR UPDATE OR DELETE ON vantage for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    -------

    CREATE TABLE vantage_mode (
        vantage_mode_id                                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        vantage_id                                     integer           NOT NULL,
        name                                           varchar(50)       NOT NULL,
        description                                    varchar(1000),
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT vantage_mode_pk PRIMARY KEY (vantage_mode_id)
    );

    COMMENT ON TABLE vantage_mode IS 'Vantage mode options that can be made available for method lookup options.';
    COMMENT ON COLUMN vantage_mode.vantage_mode_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN vantage_mode.vantage_id IS 'The vantage of the record.';
    COMMENT ON COLUMN vantage_mode.name IS 'The name of the record.';
    COMMENT ON COLUMN vantage_mode.description IS 'The description of the record.';
    COMMENT ON COLUMN vantage_mode.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN vantage_mode.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN vantage_mode.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_mode.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN vantage_mode.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_mode.revision_count IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint (don't allow 2 records with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX vantage_mode_nuk1 ON vantage_mode(vantage_id, name, (record_end_date is NULL)) where record_end_date is null;

    -- Add indexes for foreign keys
    ALTER TABLE vantage_mode ADD CONSTRAINT vantage_mode_fk1
      FOREIGN KEY (vantage_id)
      REFERENCES vantage(vantage_id);

    -- Add foreign key index
    CREATE INDEX vantage_mode_idx1 ON vantage_mode(vantage_id);

    -- Add audit/journal triggers
    CREATE TRIGGER audit_vantage_mode BEFORE INSERT OR UPDATE OR DELETE ON vantage_mode for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_vantage_mode AFTER INSERT OR UPDATE OR DELETE ON vantage_mode for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    -------

    CREATE TABLE vantage_mode_method (
        vantage_mode_method_id                         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        vantage_mode_id                                integer           NOT NULL,
        method_lookup_id                               integer           NOT NULL,
        description                                    varchar(1000),
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT vantage_mode_method_pk PRIMARY KEY (vantage_mode_method_id)
    );

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

    -- Add unique end-date key constraint (don't allow 2 records with the same vantage_mode_id, method_lookup_id and a NULL record_end_date)
    CREATE UNIQUE INDEX vantage_mode_method_nuk1 ON vantage_mode_method (vantage_mode_id, method_lookup_id, (record_end_date is NULL)) where record_end_date is null;

    -- Add foreign key constraints
    ALTER TABLE vantage_mode_method ADD CONSTRAINT vantage_mode_method_fk1
      FOREIGN KEY (method_lookup_id)
      REFERENCES method_lookup (method_lookup_id);

    ALTER TABLE vantage_mode_method ADD CONSTRAINT vantage_mode_method_fk2
      FOREIGN KEY (vantage_mode_id)
      REFERENCES vantage_mode (vantage_mode_id);

    -- Add indexes for foreign keys
    CREATE INDEX vantage_mode_method_idx1 ON vantage_mode_method(method_lookup_id);

    CREATE INDEX vantage_mode_method_idx2 ON vantage_mode_method(vantage_mode_id);

    -- Add audit/journal triggers
    CREATE TRIGGER audit_vantage_mode_method BEFORE INSERT OR UPDATE OR DELETE ON vantage_mode_method for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_vantage_mode_method AFTER INSERT OR UPDATE OR DELETE ON vantage_mode_method for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    -------

    CREATE TABLE method_technique_vantage_mode (
        method_technique_vantage_mode_id               integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        method_technique_id                            integer           NOT NULL,
        vantage_mode_method_id                         integer           NOT NULL,
        description                                    varchar(1000),
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT method_technique_vantage_mode_pk PRIMARY KEY (method_technique_vantage_mode_id)
    );

    COMMENT ON TABLE method_technique_vantage_mode IS 'Join table applying vantage modes to techniques.';
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

    -- Add unique index
    CREATE UNIQUE INDEX method_technique_vantage_mode_uk1 ON method_technique_vantage_mode (method_technique_id, vantage_mode_method_id);

    -- Add foreign key constraints
    ALTER TABLE method_technique_vantage_mode ADD CONSTRAINT method_technique_vantage_mode_fk1
      FOREIGN KEY (method_technique_id)
      REFERENCES method_technique (method_technique_id);

    ALTER TABLE method_technique_vantage_mode ADD CONSTRAINT method_technique_vantage_mode_fk2
      FOREIGN KEY (vantage_mode_method_id)
      REFERENCES vantage_mode_method (vantage_mode_method_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_technique_vantage_mode_idx1 ON method_technique_vantage_mode(method_technique_id);

    CREATE INDEX method_technique_vantage_mode_idx2 ON method_technique_vantage_mode(vantage_mode_method_id);

    -- Add audit/journal triggers
    CREATE TRIGGER audit_method_technique_vantage_mode BEFORE INSERT OR UPDATE OR DELETE ON method_technique_vantage_mode for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_technique_vantage_mode AFTER INSERT OR UPDATE OR DELETE ON method_technique_vantage_mode for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- POPULATE INITIAL VATAGE TABLE VALUES
    ----------------------------------------------------------------------------------------

    INSERT INTO
      vantage (name, description)
    VALUES
      ('air', 'View from an aircraft or drone.'),
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
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'on-road vehicle', 'In a truck, car, or similar on-road vehicle.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'off-road vehicle', 'On a quad, dirtbike, or similar all-terrain vehicle.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'horseback', 'On horseback.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'snowmobile', 'On a snowmobile.'),
      ((SELECT vantage_id FROM vantage WHERE name = 'ground'), 'bike', 'On a bicycle.'),

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
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'on-road vehicle' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'off-road vehicle' AND v.name = 'ground')),
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
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'stationary fixture' AND v.name = 'water')),

      -- Ground Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'foot' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'on-road vehicle' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'off-road vehicle' AND v.name = 'ground')),
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
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'on-road vehicle' AND v.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_mode_id FROM vantage_mode vm JOIN vantage v ON v.vantage_id = vm.vantage_id WHERE vm.name = 'off-road vehicle' AND v.name = 'ground')),
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
    -- ADD/UPDATE VIEWS
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

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
