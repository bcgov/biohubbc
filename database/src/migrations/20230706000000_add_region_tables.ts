import { Knex } from 'knex';

/**
 * // add new table for region lookup and connection table to project and survey
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
	set search_path= biohub, public;

    CREATE TABLE region_lookup (
        region_id       integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        region_name     varchar(300)                NOT NULL,
        org_unit        varchar(10)                 NOT NULL,
        org_unit_name   varchar(300)                NOT NULL,
        feature_code    varchar(50),
        feature_name    varchar(50),
        object_id       integer                     NOT NULL,
        geojson         jsonb                       NOT NULL,
        geometry        geometry(geometry, 3005),
        geography       geography(geometry, 4326),
        create_date     timestamptz(6)              DEFAULT now() NOT NULL,
        create_user     integer                     NOT NULL,
        update_date     timestamptz(6),
        update_user     integer,
        revision_count  integer                     DEFAULT 0 NOT NULL,
        CONSTRAINT region_lookup_pk PRIMARY KEY (region_id)
    );

    COMMENT ON COLUMN region_lookup.region_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN region_lookup.region_name IS 'Name given to region.';
    COMMENT ON COLUMN region_lookup.org_unit IS 'Organization unit code.';
    COMMENT ON COLUMN region_lookup.org_unit_name IS 'Organization unit name.';
    COMMENT ON COLUMN region_lookup.feature_code IS 'Feature code.';
    COMMENT ON COLUMN region_lookup.feature_name IS 'Feature name.';
    COMMENT ON COLUMN region_lookup.object_id IS 'Object ID from gov.';
    COMMENT ON COLUMN region_lookup.geojson IS 'A JSON representation of the project boundary geometry that provides necessary details for shape manipulation in client side tools.';
    COMMENT ON COLUMN region_lookup.geometry IS 'The containing geometry of the record.';
    COMMENT ON COLUMN region_lookup.geography IS 'The containing geography of the record.';
    COMMENT ON COLUMN region_lookup.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN region_lookup.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN region_lookup.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN region_lookup.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN region_lookup.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE region_lookup IS 'Lookup table for regions.';


    CREATE TABLE project_region (
        project_region_id     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        project_id            integer           NOT NULL,
        region_id             integer           NOT NULL,
        create_date           timestamptz(6)    DEFAULT now() NOT NULL,
        create_user           integer           NOT NULL,
        update_date           timestamptz(6),
        update_user           integer,
        revision_count        integer           DEFAULT 0 NOT NULL,
        CONSTRAINT project_region_pk PRIMARY KEY (project_region_id)
    );

    COMMENT ON COLUMN project_region.project_region_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_region.project_id IS 'Foreign key referencing projects table.';
    COMMENT ON COLUMN project_region.region_id IS 'Foreign key referencing region_lookup table.';
    COMMENT ON COLUMN project_region.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_region.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_region.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_region.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_region.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE project_region IS 'Connection table between projects and regions.';

    CREATE TABLE survey_region (
        survey_region_id     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        survey_id            integer           NOT NULL,
        region_id            integer           NOT NULL,
        create_date          timestamptz(6)    DEFAULT now() NOT NULL,
        create_user          integer           NOT NULL,
        update_date          timestamptz(6),
        update_user          integer,
        revision_count       integer           DEFAULT 0 NOT NULL,
        CONSTRAINT survey_region_pk PRIMARY KEY (survey_region_id)
    );

    COMMENT ON COLUMN survey_region.survey_region_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_region.survey_id IS 'Foreign key referencing surveys table.';
    COMMENT ON COLUMN survey_region.region_id IS 'Foreign key referencing region_lookup table.';
    COMMENT ON COLUMN survey_region.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_region.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_region.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_region.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_region.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE survey_region IS 'Connection table between surveys and regions.';

    ALTER TABLE project_region ADD CONSTRAINT project_region_fk001 FOREIGN KEY (project_id) REFERENCES project (project_id);
    ALTER TABLE project_region ADD CONSTRAINT project_region_fk002 FOREIGN KEY (region_id) REFERENCES region_lookup (region_id);
    ALTER TABLE survey_region ADD CONSTRAINT survey_region_fk001 FOREIGN KEY (survey_id) REFERENCES survey (survey_id);
    ALTER TABLE survey_region ADD CONSTRAINT survey_region_fk002 FOREIGN KEY (region_id) REFERENCES region_lookup (region_id);


    create trigger audit_submission_spatial_component before insert or update or delete on region_lookup for each row execute procedure tr_audit_trigger();
    create trigger audit_spatial_transform before insert or update or delete on project_region for each row execute procedure tr_audit_trigger();
    create trigger audit_spatial_transform_submission before insert or update or delete on survey_region for each row execute procedure tr_audit_trigger();

    create trigger journal_submission_spatial_component after insert or update or delete on region_lookup for each row execute procedure tr_journal_trigger();
    create trigger journal_spatial_transform after insert or update or delete on project_region for each row execute procedure tr_journal_trigger();
    create trigger journal_spatial_transform_submission after insert or update or delete on survey_region for each row execute procedure tr_journal_trigger();

    set search_path= biohub_dapi_v1;

    create or replace view region_lookup as select * from biohub.region_lookup;
    create or replace view project_region as select * from biohub.project_region;
    create or replace view survey_region as select * from biohub.survey_region;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
