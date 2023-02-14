import { Knex } from 'knex';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=biohub_dapi_v1;

  drop view if exists project;
  drop view if exists survey;
  
  set search_path=biohub;

  alter table project drop column publish_timestamp;
  alter table survey drop column publish_timestamp;

  CREATE TABLE project_attachment_publish(
    project_attachment_publish_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_attachment_id            integer           NOT NULL,
    event_timestamp                  timestamptz(6)    NOT NULL,
    artifact_revision_id             integer           NOT NULL,
    create_date                      timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                      integer           NOT NULL,
    update_date                      timestamptz(6),
    update_user                      integer,
    revision_count                   integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_attachment_publish_pk PRIMARY KEY (project_attachment_publish_id)
  );

  COMMENT ON COLUMN project_attachment_publish.project_attachment_publish_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN project_attachment_publish.project_attachment_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN project_attachment_publish.event_timestamp IS 'The timestamp of the associated event.';
  COMMENT ON COLUMN project_attachment_publish.artifact_revision_id IS 'The artifact revision identifier returned from the BioHub collection system.';
  COMMENT ON COLUMN project_attachment_publish.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN project_attachment_publish.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN project_attachment_publish.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN project_attachment_publish.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN project_attachment_publish.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE project_attachment_publish IS 'Provides a history of project attachment publish events to BioHub data collection systems.';

  CREATE TABLE project_metadata_publish(
    project_metadata_publish_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                     integer           NOT NULL,
    event_timestamp                timestamptz(6)    NOT NULL,
    queue_id                       integer           NOT NULL,
    create_date                    timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                    integer           NOT NULL,
    update_date                    timestamptz(6),
    update_user                    integer,
    revision_count                 integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_metadata_publish_pk PRIMARY KEY (project_metadata_publish_id)
  );

  COMMENT ON COLUMN project_metadata_publish.project_metadata_publish_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN project_metadata_publish.project_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN project_metadata_publish.event_timestamp IS 'The timestamp of the associated event.';
  COMMENT ON COLUMN project_metadata_publish.queue_id IS 'The job queue identifier returned from the BioHub collection system.';
  COMMENT ON COLUMN project_metadata_publish.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN project_metadata_publish.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN project_metadata_publish.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN project_metadata_publish.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN project_metadata_publish.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE project_metadata_publish IS 'Provides a history of project metadata publish events to BioHub data collection systems.';

  CREATE TABLE project_report_publish(
    project_report_publish_id       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_report_attachment_id    integer           NOT NULL,
    event_timestamp                 timestamptz(6)    NOT NULL,
    artifact_revision_id            integer           NOT NULL,
    create_date                     timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                     integer           NOT NULL,
    update_date                     timestamptz(6),
    update_user                     integer,
    revision_count                  integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_report_publish_pk PRIMARY KEY (project_report_publish_id)
  );

  COMMENT ON COLUMN project_report_publish.project_report_publish_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN project_report_publish.project_report_attachment_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN project_report_publish.event_timestamp IS 'The timestamp of the associated event.';
  COMMENT ON COLUMN project_report_publish.artifact_revision_id IS 'The artifact revision identifier returned from the BioHub collection system.';
  COMMENT ON COLUMN project_report_publish.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN project_report_publish.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN project_report_publish.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN project_report_publish.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN project_report_publish.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE project_report_publish IS 'Provides a history of project report publish events to BioHub data collection systems.';

  CREATE TABLE survey_attachment_publish(
    survey_attachment_publish_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_attachment_id            integer           NOT NULL,
    event_timestamp                 timestamptz(6)    NOT NULL,
    artifact_revision_id            integer           NOT NULL,
    create_date                     timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                     integer           NOT NULL,
    update_date                     timestamptz(6),
    update_user                     integer,
    revision_count                  integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_attachment_publish_pk PRIMARY KEY (survey_attachment_publish_id)
  );

  COMMENT ON COLUMN survey_attachment_publish.survey_attachment_publish_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_attachment_publish.survey_attachment_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_attachment_publish.event_timestamp IS 'The timestamp of the associated event.';
  COMMENT ON COLUMN survey_attachment_publish.artifact_revision_id IS 'The artifact revision identifier returned from the BioHub collection system.';
  COMMENT ON COLUMN survey_attachment_publish.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_attachment_publish.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_attachment_publish.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_attachment_publish.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_attachment_publish.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE survey_attachment_publish IS 'Provides a history of survey attachment publish events to BioHub data collection systems.';

  CREATE TABLE survey_metadata_publish(
    survey_metadata_publish_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_id                     integer           NOT NULL,
    event_timestamp               timestamptz(6)    NOT NULL,
    queue_id                      integer           NOT NULL,
    create_date                   timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                   integer           NOT NULL,
    update_date                   timestamptz(6),
    update_user                   integer,
    revision_count                integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_metadata_publish_pk PRIMARY KEY (survey_metadata_publish_id)
  );

  COMMENT ON COLUMN survey_metadata_publish.survey_metadata_publish_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_metadata_publish.survey_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_metadata_publish.event_timestamp IS 'The timestamp of the associated event.';
  COMMENT ON COLUMN survey_metadata_publish.queue_id IS 'The job queue identifier returned from the BioHub collection system.';
  COMMENT ON COLUMN survey_metadata_publish.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_metadata_publish.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_metadata_publish.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_metadata_publish.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_metadata_publish.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE survey_metadata_publish IS 'Provides a history of survey metadata publish events to BioHub data collection systems.';

  CREATE TABLE survey_report_publish(
    survey_report_publish_id       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_report_attachment_id    integer           NOT NULL,
    event_timestamp                timestamptz(6)    NOT NULL,
    artifact_revision_id           integer           NOT NULL,
    create_date                    timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                    integer           NOT NULL,
    update_date                    timestamptz(6),
    update_user                    integer,
    revision_count                 integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_report_publish_pk PRIMARY KEY (survey_report_publish_id)
  );

  COMMENT ON COLUMN survey_report_publish.survey_report_publish_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_report_publish.survey_report_attachment_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_report_publish.event_timestamp IS 'The timestamp of the associated event.';
  COMMENT ON COLUMN survey_report_publish.artifact_revision_id IS 'The artifact revision identifier returned from the BioHub collection system.';
  COMMENT ON COLUMN survey_report_publish.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_report_publish.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_report_publish.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_report_publish.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_report_publish.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE survey_report_publish IS 'Provides a history of survey report publish events to BioHub data collection systems.';

  CREATE UNIQUE INDEX project_attachment_publish_uk1 ON project_attachment_publish(artifact_revision_id);
  CREATE INDEX "Ref141229" ON project_attachment_publish(project_attachment_id);
  CREATE UNIQUE INDEX project_metadata_publish_uk1 ON project_metadata_publish(queue_id);
  CREATE INDEX "Ref45225" ON project_metadata_publish(project_id);
  CREATE UNIQUE INDEX project_report_publish_uk1 ON project_report_publish(artifact_revision_id);
  CREATE INDEX "Ref206230" ON project_report_publish(project_report_attachment_id);
  CREATE UNIQUE INDEX survey_attachment_publish_uk1 ON survey_attachment_publish(artifact_revision_id);
  CREATE INDEX "Ref161227" ON survey_attachment_publish(survey_attachment_id);
  CREATE UNIQUE INDEX survey_metadata_publish_uk1 ON survey_metadata_publish(queue_id);
  CREATE INDEX "Ref153226" ON survey_metadata_publish(survey_id);
  CREATE UNIQUE INDEX survey_report_publish_uk1 ON survey_report_publish(artifact_revision_id);
  CREATE INDEX "Ref213228" ON survey_report_publish(survey_report_attachment_id);

  ALTER TABLE project_attachment_publish ADD CONSTRAINT "Refproject_attachment229" 
    FOREIGN KEY (project_attachment_id)
    REFERENCES project_attachment(project_attachment_id);
  ALTER TABLE project_metadata_publish ADD CONSTRAINT "Refproject225" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id);
  ALTER TABLE project_report_publish ADD CONSTRAINT "Refproject_report_attachment230" 
    FOREIGN KEY (project_report_attachment_id)
    REFERENCES project_report_attachment(project_report_attachment_id);
  ALTER TABLE survey_attachment_publish ADD CONSTRAINT "Refsurvey_attachment227" 
    FOREIGN KEY (survey_attachment_id)
    REFERENCES survey_attachment(survey_attachment_id);
  ALTER TABLE survey_metadata_publish ADD CONSTRAINT "Refsurvey226" 
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);
  ALTER TABLE survey_report_publish ADD CONSTRAINT "Refsurvey_report_attachment228" 
    FOREIGN KEY (survey_report_attachment_id)
    REFERENCES survey_report_attachment(survey_report_attachment_id);

  set search_path=biohub_dapi_v1;  
  
  create or replace view project as select * from biohub.project;
  create or replace view survey as select * from biohub.survey;
  create or replace view project_attachment_publish as select * from biohub.project_attachment_publish;
  create or replace view project_metadata_publish as select * from biohub.project_metadata_publish;
  create or replace view project_report_publish as select * from biohub.project_report_publish;
  create or replace view survey_attachment_publish as select * from biohub.survey_attachment_publish;
  create or replace view survey_metadata_publish as select * from biohub.survey_metadata_publish;
  create or replace view survey_report_publish as select * from biohub.survey_report_publish;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
