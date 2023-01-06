import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const API_SCHEMA = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=${API_SCHEMA};

  drop view if exists occurrence;

  set search_path=${DB_SCHEMA}, public;

  drop table if exists occurrence;

  CREATE TABLE spatial_transform(
    spatial_transform_id     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(100)      NOT NULL,
    description              varchar(3000),
    notes                    varchar(3000),
    transform                text              NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT spatial_transform_pk PRIMARY KEY (spatial_transform_id)
);

COMMENT ON COLUMN spatial_transform.spatial_transform_id IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN spatial_transform.name IS 'The name of the record.';
COMMENT ON COLUMN spatial_transform.description IS 'The description of the record.';
COMMENT ON COLUMN spatial_transform.notes IS 'Notes associated with the record.';
COMMENT ON COLUMN spatial_transform.transform IS 'A SQL statement or fragment suitable for the identification of spatial components from submission source and subsequent population of a machine readable dataset that describes the map viewable attributes of that component.';
COMMENT ON COLUMN spatial_transform.record_effective_date IS 'Record level effective date.';
COMMENT ON COLUMN spatial_transform.record_end_date IS 'Record level end date.';
COMMENT ON COLUMN spatial_transform.create_date IS 'The datetime the record was created.';
COMMENT ON COLUMN spatial_transform.create_user IS 'The id of the user who created the record as identified in the system user table.';
COMMENT ON COLUMN spatial_transform.update_date IS 'The datetime the record was updated.';
COMMENT ON COLUMN spatial_transform.update_user IS 'The id of the user who updated the record as identified in the system user table.';
COMMENT ON COLUMN spatial_transform.revision_count IS 'Revision count used for concurrency control.';
COMMENT ON TABLE spatial_transform IS 'Spatial transforms are SQL statements that dynamically operate on submission source to extract spatial components of interest for map display.';

CREATE TABLE spatial_transform_submission(
  spatial_transform_submission_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
  spatial_transform_id               integer           NOT NULL,
  submission_spatial_component_id    integer           NOT NULL,
  create_date                        timestamptz(6)    DEFAULT now() NOT NULL,
  create_user                        integer           NOT NULL,
  update_date                        timestamptz(6),
  update_user                        integer,
  revision_count                     integer           DEFAULT 0 NOT NULL,
  CONSTRAINT spatial_transform_submission_pk PRIMARY KEY (spatial_transform_submission_id)
);

COMMENT ON COLUMN spatial_transform_submission.spatial_transform_submission_id IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN spatial_transform_submission.spatial_transform_id IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN spatial_transform_submission.submission_spatial_component_id IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN spatial_transform_submission.create_date IS 'The datetime the record was created.';
COMMENT ON COLUMN spatial_transform_submission.create_user IS 'The id of the user who created the record as identified in the system user table.';
COMMENT ON COLUMN spatial_transform_submission.update_date IS 'The datetime the record was updated.';
COMMENT ON COLUMN spatial_transform_submission.update_user IS 'The id of the user who updated the record as identified in the system user table.';
COMMENT ON COLUMN spatial_transform_submission.revision_count IS 'Revision count used for concurrency control.';
COMMENT ON TABLE spatial_transform_submission IS 'A associative entity that joins spatial transforms with submission spatial components.';

CREATE TABLE submission_spatial_component(
  submission_spatial_component_id    integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
  occurrence_submission_id           integer                     NOT NULL,
  spatial_component                  character(10)               NOT NULL,
  geometry                           geometry(geometry, 3005),
  geography                          geography(geometry),
  create_date                        timestamptz(6)              DEFAULT now() NOT NULL,
  create_user                        integer                     NOT NULL,
  update_date                        timestamptz(6),
  update_user                        integer,
  revision_count                     integer                     DEFAULT 0 NOT NULL,
  CONSTRAINT submission_spatial_component_pk PRIMARY KEY (submission_spatial_component_id)
);

COMMENT ON COLUMN submission_spatial_component.submission_spatial_component_id IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN submission_spatial_component.occurrence_submission_id IS 'System generated surrogate primary key identifier.';
COMMENT ON COLUMN submission_spatial_component.spatial_component IS 'A spatial component is a JSON attribute representation of a viewable map object.';
COMMENT ON COLUMN submission_spatial_component.geometry IS 'The containing geometry of the spatial component attribute.';
COMMENT ON COLUMN submission_spatial_component.geography IS 'The containing geography of the spatial component attribute.';
COMMENT ON COLUMN submission_spatial_component.create_date IS 'The datetime the record was created.';
COMMENT ON COLUMN submission_spatial_component.create_user IS 'The id of the user who created the record as identified in the system user table.';
COMMENT ON COLUMN submission_spatial_component.update_date IS 'The datetime the record was updated.';
COMMENT ON COLUMN submission_spatial_component.update_user IS 'The id of the user who updated the record as identified in the system user table.';
COMMENT ON COLUMN submission_spatial_component.revision_count IS 'Revision count used for concurrency control.';
COMMENT ON TABLE submission_spatial_component IS 'Submission spatial components are spatial features and their desired map representations as extracted from submission source data.';

CREATE UNIQUE INDEX spatial_transform_nuk1 ON spatial_transform(name, (record_end_date is NULL)) where record_end_date is null;
CREATE UNIQUE INDEX spatial_transform_submission_uk1 ON spatial_transform_submission(spatial_transform_id, submission_spatial_component_id);
CREATE INDEX "Ref229222" ON spatial_transform_submission(spatial_transform_id);
CREATE INDEX "Ref228223" ON spatial_transform_submission(submission_spatial_component_id);
CREATE INDEX "Ref165224" ON submission_spatial_component(occurrence_submission_id);

ALTER TABLE spatial_transform_submission ADD CONSTRAINT "Refspatial_transform222" 
    FOREIGN KEY (spatial_transform_id)
    REFERENCES spatial_transform(spatial_transform_id);
ALTER TABLE spatial_transform_submission ADD CONSTRAINT "Refsubmission_spatial_component223" 
    FOREIGN KEY (submission_spatial_component_id)
    REFERENCES submission_spatial_component(submission_spatial_component_id);

create trigger audit_submission_spatial_component before insert or update or delete on submission_spatial_component for each row execute procedure tr_audit_trigger();
create trigger audit_spatial_transform before insert or update or delete on spatial_transform for each row execute procedure tr_audit_trigger();
create trigger audit_spatial_transform_submission before insert or update or delete on spatial_transform_submission for each row execute procedure tr_audit_trigger();

create trigger journal_submission_spatial_component after insert or update or delete on submission_spatial_component for each row execute procedure tr_journal_trigger();
create trigger journal_spatial_transform after insert or update or delete on spatial_transform for each row execute procedure tr_journal_trigger();
create trigger journal_spatial_transform_submission after insert or update or delete on spatial_transform_submission for each row execute procedure tr_journal_trigger();

  set search_path=${API_SCHEMA};  
  
  create or replace view spatial_transform as select * from ${DB_SCHEMA}.spatial_transform;
  create or replace view spatial_transform_submission as select * from ${DB_SCHEMA}.spatial_transform_submission;
  create or replace view submission_spatial_component as select * from ${DB_SCHEMA}.submission_spatial_component;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
