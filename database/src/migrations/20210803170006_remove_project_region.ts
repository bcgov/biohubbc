import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    DROP VIEW if exists biohub_dapi_v1.project_region;

    set role postgres;

    DROP TRIGGER if exists audit_project_region on project_region;
    DROP TRIGGER if exists journal_project_region on project_region;
    DROP TABLE if exists project_region;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;


    CREATE TABLE project_region(
      project_region_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      project_id           integer           NOT NULL,
      name                 varchar(200)      NOT NULL,
      create_date          timestamptz(6)    DEFAULT now() NOT NULL,
      create_user          integer           NOT NULL,
      update_date          timestamptz(6),
      update_user          integer,
      revision_count       integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_region_pk PRIMARY KEY (project_region_id)
    );

    COMMENT ON COLUMN project_region.project_region_id IS 'System generated surrogate primary key identifier.'
    ;
    COMMENT ON COLUMN project_region.project_id IS 'System generated surrogate primary key identifier.'
    ;
    COMMENT ON COLUMN project_region.name IS 'The region name.'
    ;
    COMMENT ON COLUMN project_region.create_date IS 'The datetime the record was created.'
    ;
    COMMENT ON COLUMN project_region.create_user IS 'The id of the user who created the record as identified in the system user table.'
    ;
    COMMENT ON COLUMN project_region.update_date IS 'The datetime the record was updated.'
    ;
    COMMENT ON COLUMN project_region.update_user IS 'The id of the user who updated the record as identified in the system user table.'
    ;
    COMMENT ON COLUMN project_region.revision_count IS 'Revision count used for concurrency control.'
    ;
    COMMENT ON TABLE project_region IS 'The region of a project.'
    ;

    ALTER TABLE project_region ADD CONSTRAINT "Refproject131"
      FOREIGN KEY (project_id)
      REFERENCES project(project_id)
    ;

    create trigger audit_project_region before insert or update or delete on project_region for each row execute procedure tr_audit_trigger();
    create trigger journal_project_region after insert or update or delete on project_region for each row execute procedure tr_journal_trigger();

    set search_path = ${DB_SCHEMA}_dapi_v1;
    set role ${DB_SCHEMA}_api;
    create or replace view project_region as select * from ${DB_SCHEMA}.project_region;

    set role postgres;
    set search_path = ${DB_SCHEMA},public;
  `);
}
