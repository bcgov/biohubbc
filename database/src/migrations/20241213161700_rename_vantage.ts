import { Knex } from 'knex';

/**
 * Migration to rename the "vantage" table to "vantage_mode_category"
 * and rename its primary key column "vantage_id" to "vantage_mode_category_id".
 * It also updates the foreign key references in related tables using raw SQL.
 *
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

    ----------------------------------------------------------------------------------------
    -- DROP TABLES CREATED IN PREVIOUS MIGRATION (simpler to just drop and recreate instead of rename everything)
    ----------------------------------------------------------------------------------------
    
    -- Drop the triggers first
    DROP TRIGGER IF EXISTS audit_vantage ON biohub.vantage;
    DROP TRIGGER IF EXISTS journal_vantage ON biohub.vantage;
    DROP TRIGGER IF EXISTS audit_vantage_mode ON biohub.vantage_mode;
    DROP TRIGGER IF EXISTS journal_vantage_mode ON biohub.vantage_mode;
    DROP TRIGGER IF EXISTS audit_vantage_mode_method ON biohub.vantage_mode_method;
    DROP TRIGGER IF EXISTS journal_vantage_mode_method ON biohub.vantage_mode_method;
    DROP TRIGGER IF EXISTS audit_method_technique_vantage_mode ON biohub.method_technique_vantage_mode;
    DROP TRIGGER IF EXISTS journal_method_technique_vantage_mode ON biohub.method_technique_vantage_mode;

    -- Drop the indexes
    DROP INDEX IF EXISTS biohub.vantage_nuk1;
    DROP INDEX IF EXISTS biohub.vantage_mode_nuk1;
    DROP INDEX IF EXISTS biohub.vantage_mode_method_nuk1;
    DROP INDEX IF EXISTS biohub.method_technique_vantage_mode_uk1;

    -- Drop the foreign key constraints
    ALTER TABLE biohub.vantage_mode_method DROP CONSTRAINT IF EXISTS vantage_mode_method_fk1;
    ALTER TABLE biohub.vantage_mode_method DROP CONSTRAINT IF EXISTS vantage_mode_method_fk2;
    ALTER TABLE biohub.method_technique_vantage_mode DROP CONSTRAINT IF EXISTS method_technique_vantage_mode_fk1;
    ALTER TABLE biohub.method_technique_vantage_mode DROP CONSTRAINT IF EXISTS method_technique_vantage_mode_fk2;

    -- Drop the tables
    DROP TABLE IF EXISTS biohub.vantage_mode_method CASCADE;
    DROP TABLE IF EXISTS biohub.vantage_mode CASCADE;
    DROP TABLE IF EXISTS biohub.vantage CASCADE;
    DROP TABLE IF EXISTS biohub.method_technique_vantage_mode CASCADE;

    -- Drop the views
    DROP VIEW IF EXISTS biohub_dapi_v1.vantage CASCADE;
    DROP VIEW IF EXISTS biohub_dapi_v1.vantage_mode CASCADE;
    DROP VIEW IF EXISTS biohub_dapi_v1.vantage_mode_method CASCADE;
    DROP VIEW IF EXISTS biohub_dapi_v1.method_technique CASCADE;
    DROP VIEW IF EXISTS biohub_dapi_v1.method_technique_vantage_mode CASCADE;

    ----------------------------------------------------------------------------------------
    -- ADD NEW VANTAGE-RELATED TABLES (same as previous migration, but updated names)
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    CREATE TABLE vantage_category (
        vantage_category_id                                     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                                           varchar(50)       NOT NULL,
        description                                    varchar(1000),
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT vantage_category_pk PRIMARY KEY (vantage_category_id)
    );

    COMMENT ON TABLE vantage_category IS 'vantage_categorys that vantage_category_mode records belong to, like categories of modes.';
    COMMENT ON COLUMN vantage_category.vantage_category_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN vantage_category.name IS 'The name of the record.';
    COMMENT ON COLUMN vantage_category.description IS 'The description of the record.';
    COMMENT ON COLUMN vantage_category.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN vantage_category.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN vantage_category.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_category.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN vantage_category.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_category.revision_count IS 'Revision count used for concurrency control.';

    -- Triggers, indexes

    -- Add unique end-date key constraint (don't allow 2 records with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX vantage_category_nuk1 ON vantage_category(name, (record_end_date is NULL)) where record_end_date is null;

    -- Add audit/journal triggers
    CREATE TRIGGER audit_vantage_category BEFORE INSERT OR UPDATE OR DELETE ON vantage_category for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_vantage_category AFTER INSERT OR UPDATE OR DELETE ON vantage_category for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    -------

    CREATE TABLE vantage (
        vantage_id                                     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        vantage_category_id                            integer           NOT NULL,
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

    COMMENT ON TABLE vantage IS 'Vantage mode options that can be made available for method lookup options.';
    COMMENT ON COLUMN vantage.vantage_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN vantage.vantage_category_id IS 'The vantage category of the record.';
    COMMENT ON COLUMN vantage.name IS 'The name of the record.';
    COMMENT ON COLUMN vantage.description IS 'The description of the record.';
    COMMENT ON COLUMN vantage.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN vantage.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN vantage.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN vantage.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN vantage.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN vantage.revision_count IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint (don't allow 2 records with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX vantage_nuk1 ON vantage(vantage_id, name, (record_end_date is NULL)) where record_end_date is null;

    -- Add indexes for foreign keys
    ALTER TABLE vantage ADD CONSTRAINT vantage_fk1
      FOREIGN KEY (vantage_category_id)
      REFERENCES vantage_category(vantage_category_id);

    -- Add foreign key index
    CREATE INDEX vantage_idx1 ON vantage_category(vantage_category_id);

    -- Add audit/journal triggers
    CREATE TRIGGER audit_vantage BEFORE INSERT OR UPDATE OR DELETE ON vantage for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_vantage AFTER INSERT OR UPDATE OR DELETE ON vantage for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    -------

    CREATE TABLE vantage_method (
        vantage_method_id                              integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        vantage_id                                     integer           NOT NULL,
        method_lookup_id                               integer           NOT NULL,
        description                                    varchar(1000),
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT vantage_method_pk PRIMARY KEY (vantage_method_id)
    );

    COMMENT ON TABLE vantage_method IS 'Join table indicating which vantage modes apply to which method lookup options.';
    COMMENT ON COLUMN vantage_method.vantage_method_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN vantage_method.vantage_id IS 'The vantage mode option of the record.';
    COMMENT ON COLUMN vantage_method.method_lookup_id IS 'The method lookup option of the record.';
    COMMENT ON COLUMN vantage_method.description IS 'The description of the record.';
    COMMENT ON COLUMN vantage_method.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN vantage_method.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN vantage_method.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_method.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN vantage_method.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN vantage_method.revision_count IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint (don't allow 2 records with the same vantage_id, method_lookup_id and a NULL record_end_date)
    CREATE UNIQUE INDEX vantage_method_nuk1 ON vantage_method (vantage_id, method_lookup_id, (record_end_date is NULL)) where record_end_date is null;

    -- Add foreign key constraints
    ALTER TABLE vantage_method ADD CONSTRAINT vantage_method_fk1
      FOREIGN KEY (method_lookup_id)
      REFERENCES method_lookup (method_lookup_id);

    ALTER TABLE vantage_method ADD CONSTRAINT vantage_method_fk2
      FOREIGN KEY (vantage_id)
      REFERENCES vantage (vantage_id);

    -- Add indexes for foreign keys
    CREATE INDEX vantage_method_idx1 ON vantage_method(method_lookup_id);

    CREATE INDEX vantage_method_idx2 ON vantage_method(vantage_id);

    -- Add audit/journal triggers
    CREATE TRIGGER audit_vantage_method BEFORE INSERT OR UPDATE OR DELETE ON vantage_method for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_vantage_method AFTER INSERT OR UPDATE OR DELETE ON vantage_method for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    -------

    CREATE TABLE method_technique_vantage (
        method_technique_vantage_id                    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        method_technique_id                            integer           NOT NULL,
        vantage_method_id                              integer           NOT NULL,
        description                                    varchar(1000),
        record_end_date                                date,
        create_date                                    timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                    integer           NOT NULL,
        update_date                                    timestamptz(6),
        update_user                                    integer,
        revision_count                                 integer           DEFAULT 0 NOT NULL,
        CONSTRAINT method_technique_vantage_pk PRIMARY KEY (method_technique_vantage_id)
    );

    COMMENT ON TABLE method_technique_vantage IS 'Join table applying vantage modes to techniques.';
    COMMENT ON COLUMN method_technique_vantage.method_technique_vantage_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN method_technique_vantage.method_technique_id IS 'The method technique of the record.';
    COMMENT ON COLUMN method_technique_vantage.vantage_method_id IS 'The vantage mode of the record.';
    COMMENT ON COLUMN method_technique_vantage.description IS 'The description of the record.';
    COMMENT ON COLUMN method_technique_vantage.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN method_technique_vantage.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN method_technique_vantage.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_vantage.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN method_technique_vantage.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN method_technique_vantage.revision_count IS 'Revision count used for concurrency control.';

    -- Add unique index
    CREATE UNIQUE INDEX method_technique_vantage_uk1 ON method_technique_vantage (method_technique_id, vantage_method_id);

    -- Add foreign key constraints
    ALTER TABLE method_technique_vantage ADD CONSTRAINT method_technique_vantage_fk1
      FOREIGN KEY (method_technique_id)
      REFERENCES method_technique (method_technique_id);

    ALTER TABLE method_technique_vantage ADD CONSTRAINT method_technique_vantage_fk2
      FOREIGN KEY (vantage_method_id)
      REFERENCES vantage_method (vantage_method_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_technique_vantage_idx1 ON method_technique_vantage(method_technique_id);

    CREATE INDEX method_technique_vantage_idx2 ON method_technique_vantage(vantage_method_id);

    -- Add audit/journal triggers
    CREATE TRIGGER audit_method_technique_vantage BEFORE INSERT OR UPDATE OR DELETE ON method_technique_vantage for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_method_technique_vantage AFTER INSERT OR UPDATE OR DELETE ON method_technique_vantage for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- POPULATE INITIAL VANTAGE TABLE VALUES
    ----------------------------------------------------------------------------------------

    INSERT INTO
      vantage_category (name, description)
    VALUES
      ('air', 'View from an aircraft or drone.'),
      ('arboreal', 'View from the tree canopy.'),
      ('water', 'View from a body of water.'),
      ('benthic', 'View from the bottom of a waterbody.'),
      ('ground', 'View from the ground.');

    INSERT INTO
      vantage (vantage_category_id, name, description)
    VALUES
      -- Air Vantage_category Modes
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'air'), 'helicopter', 'View from a helicopter.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'air'), 'plane', 'View from a plane.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'air'), 'drone', 'View from a drone.'),

      -- Arboreal Vantage_category Modes
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'arboreal'), 'stationary fixture', 'View from a stationary fixture in the tree canopy.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'arboreal'), 'climbing', 'View from climbing in the tree canopy.'),

      -- Water Vantage_category Modes
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'water'), 'stationary fixture', 'At a fixed position in or under the water.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'water'), 'boat', 'View from a boat or canoe.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'water'), 'kayak or canoe', 'View from a kayak or canoe.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'water'), 'submersible', 'View from an underwater submersible.'),

      -- Ground Vantage_category Modes
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'ground'), 'stationary fixture', 'At a fixed position on the ground.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'ground'), 'foot', 'On foot.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'ground'), 'on-road vehicle', 'In a truck, car, or similar on-road vehicle.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'ground'), 'off-road vehicle', 'On a quad, dirtbike, or similar all-terrain vehicle.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'ground'), 'horseback', 'On horseback.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'ground'), 'snowmobile', 'On a snowmobile.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'ground'), 'bike', 'On a bicycle.'),

      -- Benthic Vantage_category Modes
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'benthic'), 'stationary fixture', 'At a fixed position on the bottom of a waterbody.'),
      ((SELECT vantage_category_id FROM vantage_category WHERE name = 'benthic'), 'submersible', 'View from a submersible on the bottom of a waterbody.');

    INSERT INTO
      vantage_method (method_lookup_id, vantage_id)
    VALUES
      -- Visual Encounter Method
      -- Air Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'helicopter' AND vc.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'plane' AND vc.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'drone' AND vc.name = 'air')),

      -- Arboreal Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'stationary fixture' AND vc.name = 'arboreal')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'climbing' AND vc.name = 'arboreal')),

      -- Water Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'boat' AND vc.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'kayak or canoe' AND vc.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'submersible' AND vc.name = 'water')),

      -- Ground Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'foot' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'on-road vehicle' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'off-road vehicle' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'horseback' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'snowmobile' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'visual encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'bike' AND vc.name = 'ground')),

      -- Audio Encounter Method
      -- Air Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'helicopter' AND vc.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'plane' AND vc.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'drone' AND vc.name = 'air')),

      -- Arboreal Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'stationary fixture' AND vc.name = 'arboreal')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'climbing' AND vc.name = 'arboreal')),

      -- Water Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'boat' AND vc.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'kayak or canoe' AND vc.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'submersible' AND vc.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'stationary fixture' AND vc.name = 'water')),

      -- Ground Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'foot' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'on-road vehicle' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'off-road vehicle' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'horseback' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'snowmobile' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'audio encounter'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'bike' AND vc.name = 'ground')),

      -- Radar Method
      -- Air Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'helicopter' AND vc.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'plane' AND vc.name = 'air')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'drone' AND vc.name = 'air')),

      -- Ground Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'foot' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'on-road vehicle' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'off-road vehicle' AND vc.name = 'ground')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'stationary fixture' AND vc.name = 'ground')),

      -- Water Vantage Modes
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'boat' AND vc.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'kayak or canoe' AND vc.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'submersible' AND vc.name = 'water')),
      ((SELECT method_lookup_id FROM method_lookup WHERE LOWER(name) = 'radar'),
      (SELECT vantage_id FROM vantage v JOIN vantage_category vc ON vc.vantage_category_id = v.vantage_category_id WHERE v.name = 'stationary fixture' AND vc.name = 'water'));

    ----------------------------------------------------------------------------------------
    -- ADD/UPDATE VIEWS
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW vantage_category AS SELECT * FROM biohub.vantage_category;
    CREATE OR REPLACE VIEW vantage AS SELECT * FROM biohub.vantage;
    CREATE OR REPLACE VIEW vantage_method AS SELECT * FROM biohub.vantage_method;
    CREATE OR REPLACE VIEW method_technique AS SELECT * FROM biohub.method_technique;
    CREATE OR REPLACE VIEW method_technique_vantage AS SELECT * FROM biohub.method_technique_vantage;


  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
