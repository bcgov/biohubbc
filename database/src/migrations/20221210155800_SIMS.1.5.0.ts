import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 *
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=${DB_SCHEMA};

    alter table project_attachment 
      add column foi_reason_description varchar(3000),
      add column government_interest_description varchar(3000);
    comment on column project_attachment.foi_reason_description is 'The description of the Freedom of Information reason for securing of the artifact.';
    comment on column project_attachment.government_interest_description is 'The description of the government interest reason for securing of the artifact.';

    alter table project_report_attachment 
      add column foi_reason_description varchar(3000),
      add column government_interest_description varchar(3000);
    comment on column project_report_attachment.foi_reason_description is 'The description of the Freedom of Information reason for securing of the artifact.';
    comment on column project_report_attachment.government_interest_description is 'The description of the government interest reason for securing of the artifact.';

    alter table survey_attachment 
      add column foi_reason_description varchar(3000),
      add column government_interest_description varchar(3000);
    comment on column survey_attachment.foi_reason_description is 'The description of the Freedom of Information reason for securing of the artifact.';
    comment on column survey_attachment.government_interest_description is 'The description of the government interest reason for securing of the artifact.';

    alter table survey_report_attachment 
      add column foi_reason_description varchar(3000),
      add column government_interest_description varchar(3000);
    comment on column survey_report_attachment.foi_reason_description is 'The description of the Freedom of Information reason for securing of the artifact.';
    comment on column survey_report_attachment.government_interest_description is 'The description of the government interest reason for securing of the artifact.';

    alter table survey
      add government_interest_description    varchar(3000);
    COMMENT ON COLUMN survey.government_interest_description IS 'The description of the government interest reason for securing of occurrence records.';

    CREATE TABLE project_attachment_persecution(
      project_attachment_persecution_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      project_attachment_id                integer           NOT NULL,
      persecution_security_id              integer           NOT NULL,
      create_date                          timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                          integer           NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_attachment_persecution_pk PRIMARY KEY (project_attachment_persecution_id)
    );
      
    COMMENT ON COLUMN project_attachment_persecution.project_attachment_persecution_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_attachment_persecution.project_attachment_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_attachment_persecution.persecution_security_id IS 'A foreign key to a persecution or harm security label in the reference data system.';
    COMMENT ON COLUMN project_attachment_persecution.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_attachment_persecution.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_attachment_persecution.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_attachment_persecution.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_attachment_persecution.revision_count IS 'Revision count used for concurrency control.'  ;
    COMMENT ON TABLE project_attachment_persecution IS 'An intersection table defining associations between artifacts and persecution or harm security labels.';
      
    CREATE TABLE project_attachment_proprietary(
        project_attachment_proprietary_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        project_attachment_id                integer           NOT NULL,
        proprietary_security_id              integer           NOT NULL,
        proprietor                           varchar(30)       NOT NULL,
        description                          varchar(3000)     NOT NULL,
        start_date                           date,
        end_date                             date,
        create_date                          timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                          integer           NOT NULL,
        update_date                          timestamptz(6),
        update_user                          integer,
        revision_count                       integer           DEFAULT 0 NOT NULL,
        CONSTRAINT project_attachment_proprietary_pk PRIMARY KEY (project_attachment_proprietary_id)
    );
    
    COMMENT ON COLUMN project_attachment_proprietary.project_attachment_proprietary_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_attachment_proprietary.project_attachment_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_attachment_proprietary.proprietary_security_id IS 'A foreign key to a proprietary security label in the reference data system.';
    COMMENT ON COLUMN project_attachment_proprietary.proprietor IS 'The proprietor or owner of the artifact.';
    COMMENT ON COLUMN project_attachment_proprietary.description IS 'The description of the record.';
    COMMENT ON COLUMN project_attachment_proprietary.start_date IS 'The record start date.';
    COMMENT ON COLUMN project_attachment_proprietary.end_date IS 'The record end date.';
    COMMENT ON COLUMN project_attachment_proprietary.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_attachment_proprietary.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_attachment_proprietary.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_attachment_proprietary.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_attachment_proprietary.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE project_attachment_proprietary IS 'An intersection table defining associations between artifacts and proprietary security labels.';

    CREATE TABLE project_report_persecution(
      project_report_persecution_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      project_report_attachment_id     integer           NOT NULL,
      persecution_security_id          integer           NOT NULL,
      create_date                      timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                      integer           NOT NULL,
      update_date                      timestamptz(6),
      update_user                      integer,
      revision_count                   integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_report_persecution_pk PRIMARY KEY (project_report_persecution_id)
    );

    COMMENT ON COLUMN project_report_persecution.project_report_persecution_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_report_persecution.project_report_attachment_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_report_persecution.persecution_security_id IS 'A foreign key to a persecution or harm security label in the reference data system.';
    COMMENT ON COLUMN project_report_persecution.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_report_persecution.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_report_persecution.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_report_persecution.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_report_persecution.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE project_report_persecution IS 'An intersection table defining associations between artifacts and persecution or harm security labels.';

    CREATE TABLE project_report_proprietary(
        project_report_proprietary_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        project_report_attachment_id     integer           NOT NULL,
        proprietary_security_id          integer           NOT NULL,
        proprietor                       varchar(30)       NOT NULL,
        description                      varchar(3000)     NOT NULL,
        start_date                       date,
        end_date                         date,
        create_date                      timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                      integer           NOT NULL,
        update_date                      timestamptz(6),
        update_user                      integer,
        revision_count                   integer           DEFAULT 0 NOT NULL,
        CONSTRAINT project_report_proprietary_pk PRIMARY KEY (project_report_proprietary_id)
    );

    COMMENT ON COLUMN project_report_proprietary.project_report_proprietary_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_report_proprietary.project_report_attachment_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_report_proprietary.proprietary_security_id IS 'A foreign key to a proprietary security label in the reference data system.';
    COMMENT ON COLUMN project_report_proprietary.proprietor IS 'The proprietor or owner of the artifact.';
    COMMENT ON COLUMN project_report_proprietary.description IS 'The description of the record.';
    COMMENT ON COLUMN project_report_proprietary.start_date IS 'The record start date.';
    COMMENT ON COLUMN project_report_proprietary.end_date IS 'The record end date.';
    COMMENT ON COLUMN project_report_proprietary.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_report_proprietary.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_report_proprietary.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_report_proprietary.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_report_proprietary.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE project_report_proprietary IS 'An intersection table defining associations between artifacts and proprietary security labels.';

    CREATE TABLE survey_attachment_persecution(
      survey_attachment_persecution_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_attachment_id                 integer           NOT NULL,
      persecution_security_id              integer           NOT NULL,
      create_date                          timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                          integer           NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_attachment_persecution_pk PRIMARY KEY (survey_attachment_persecution_id)
    );

    COMMENT ON COLUMN survey_attachment_persecution.survey_attachment_persecution_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_attachment_persecution.survey_attachment_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_attachment_persecution.persecution_security_id IS 'A foreign key to a persecution or harm security label in the reference data system.';
    COMMENT ON COLUMN survey_attachment_persecution.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_attachment_persecution.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_attachment_persecution.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_attachment_persecution.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_attachment_persecution.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE survey_attachment_persecution IS 'An intersection table defining associations between artifacts and persecution or harm security labels.';

    CREATE TABLE survey_attachment_proprietary(
      survey_attachment_proprietary_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_attachment_id                integer           NOT NULL,
      proprietary_security_id             integer           NOT NULL,
      proprietor                          varchar(30)       NOT NULL,
      description                         varchar(3000)     NOT NULL,
      start_date                          date,
      end_date                            date,
      create_date                         timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                         integer           NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_attachment_proprietary_pk PRIMARY KEY (survey_attachment_proprietary_id)
    );

    COMMENT ON COLUMN survey_attachment_proprietary.survey_attachment_proprietary_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_attachment_proprietary.survey_attachment_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_attachment_proprietary.proprietary_security_id IS 'A foreign key to a proprietary security label in the reference data system.';
    COMMENT ON COLUMN survey_attachment_proprietary.proprietor IS 'The proprietor or owner of the artifact.';
    COMMENT ON COLUMN survey_attachment_proprietary.description IS 'The description of the record.';
    COMMENT ON COLUMN survey_attachment_proprietary.start_date IS 'The record start date.';
    COMMENT ON COLUMN survey_attachment_proprietary.end_date IS 'The record end date.';
    COMMENT ON COLUMN survey_attachment_proprietary.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_attachment_proprietary.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_attachment_proprietary.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_attachment_proprietary.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_attachment_proprietary.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE survey_attachment_proprietary IS 'An intersection table defining associations between artifacts and proprietary security labels.';

    CREATE TABLE survey_report_persecution(
      survey_report_persecution_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_report_attachment_id     integer           NOT NULL,
      persecution_security_id         integer           NOT NULL,
      create_date                     timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                     integer           NOT NULL,
      update_date                     timestamptz(6),
      update_user                     integer,
      revision_count                  integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_report_persecution_pk PRIMARY KEY (survey_report_persecution_id)
    );

    COMMENT ON COLUMN survey_report_persecution.survey_report_persecution_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_report_persecution.survey_report_attachment_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_report_persecution.persecution_security_id IS 'A foreign key to a persecution or harm security label in the reference data system.';
    COMMENT ON COLUMN survey_report_persecution.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_report_persecution.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_report_persecution.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_report_persecution.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_report_persecution.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE survey_report_persecution IS 'An intersection table defining associations between artifacts and persecution or harm security labels.';

    CREATE TABLE survey_report_proprietary(
      survey_report_proprietary_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_report_attachment_id     integer           NOT NULL,
      proprietary_security_id         integer           NOT NULL,
      proprietor                      varchar(30)       NOT NULL,
      description                     varchar(3000)     NOT NULL,
      start_date                      date,
      end_date                        date,
      create_date                     timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                     integer           NOT NULL,
      update_date                     timestamptz(6),
      update_user                     integer,
      revision_count                  integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_report_proprietary_pk PRIMARY KEY (survey_report_proprietary_id)
    );

    COMMENT ON COLUMN survey_report_proprietary.survey_report_proprietary_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_report_proprietary.survey_report_attachment_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_report_proprietary.proprietary_security_id IS 'A foreign key to a proprietary security label in the reference data system.';
    COMMENT ON COLUMN survey_report_proprietary.proprietor IS 'The proprietor or owner of the artifact.';
    COMMENT ON COLUMN survey_report_proprietary.description IS 'The description of the record.';
    COMMENT ON COLUMN survey_report_proprietary.start_date IS 'The record start date.';
    COMMENT ON COLUMN survey_report_proprietary.end_date IS 'The record end date.';
    COMMENT ON COLUMN survey_report_proprietary.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_report_proprietary.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_report_proprietary.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_report_proprietary.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_report_proprietary.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE survey_report_proprietary IS 'An intersection table defining associations between artifacts and proprietary security labels.';

    CREATE TABLE survey_occurrence_proprietary(
      survey_occurrence_proprietary_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                          integer           NOT NULL,
      proprietary_security_id            integer           NOT NULL,
      proprietor                         varchar(30)       NOT NULL,
      description                        varchar(3000)     NOT NULL,
      start_date                         date,
      end_date                           date,
      create_date                        timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                        integer           NOT NULL,
      update_date                        timestamptz(6),
      update_user                        integer,
      revision_count                     integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_occurrence_proprietary_pk PRIMARY KEY (survey_occurrence_proprietary_id)
  );
  
    COMMENT ON COLUMN survey_occurrence_proprietary.survey_occurrence_proprietary_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_occurrence_proprietary.survey_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_occurrence_proprietary.proprietary_security_id IS 'A foreign key to a proprietary security label in the reference data system.';
    COMMENT ON COLUMN survey_occurrence_proprietary.proprietor IS 'The proprietor or owner of the artifact.';
    COMMENT ON COLUMN survey_occurrence_proprietary.description IS 'The description of the record.';
    COMMENT ON COLUMN survey_occurrence_proprietary.start_date IS 'The record start date.';
    COMMENT ON COLUMN survey_occurrence_proprietary.end_date IS 'The record end date.';
    COMMENT ON COLUMN survey_occurrence_proprietary.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_occurrence_proprietary.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_occurrence_proprietary.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_occurrence_proprietary.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_occurrence_proprietary.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE survey_occurrence_proprietary IS 'An intersection table defining associations between survey occurrences and proprietary security labels.';

    CREATE UNIQUE INDEX project_attachment_persecution_uk1 ON project_attachment_persecution(project_attachment_id, persecution_security_id);
    CREATE INDEX "Ref141223" ON project_attachment_persecution(project_attachment_id);
    CREATE UNIQUE INDEX project_attachment_proprietary_uk1 ON project_attachment_proprietary(project_attachment_id, proprietary_security_id);
    CREATE INDEX "Ref141222" ON project_attachment_proprietary(project_attachment_id);

    CREATE UNIQUE INDEX project_report_persecution_uk1 ON project_report_persecution(persecution_security_id, project_report_attachment_id);
    CREATE INDEX "Ref206226" ON project_report_persecution(project_report_attachment_id);
    CREATE UNIQUE INDEX project_report_proprietary_uk1 ON project_report_proprietary(proprietary_security_id, project_report_attachment_id);
    CREATE INDEX "Ref206224" ON project_report_proprietary(project_report_attachment_id);

    CREATE UNIQUE INDEX survey_attachment_persecution_uk1 ON survey_attachment_persecution(persecution_security_id, survey_attachment_id);
    CREATE INDEX "Ref161228" ON survey_attachment_persecution(survey_attachment_id);
    CREATE UNIQUE INDEX survey_attachment_proprietary_uk1 ON survey_attachment_proprietary(proprietary_security_id, survey_attachment_id);
    CREATE INDEX "Ref161227" ON survey_attachment_proprietary(survey_attachment_id);

    CREATE UNIQUE INDEX survey_report_persecution_uk1 ON survey_report_persecution(persecution_security_id, survey_report_attachment_id);
    CREATE INDEX "Ref213230" ON survey_report_persecution(survey_report_attachment_id);
    CREATE UNIQUE INDEX survey_report_proprietary_uk1 ON survey_report_proprietary(proprietary_security_id, survey_report_attachment_id);
    CREATE INDEX "Ref213229" ON survey_report_proprietary(survey_report_attachment_id);

    CREATE UNIQUE INDEX survey_occurrence_proprietary_uk1 ON survey_occurrence_proprietary(proprietary_security_id, survey_id);
    CREATE INDEX "Ref153231" ON survey_occurrence_proprietary(survey_id);

    ALTER TABLE project_attachment_persecution ADD CONSTRAINT "Refproject_attachment223" 
        FOREIGN KEY (project_attachment_id)
        REFERENCES project_attachment(project_attachment_id);
    ALTER TABLE project_attachment_proprietary ADD CONSTRAINT "Refproject_attachment222" 
        FOREIGN KEY (project_attachment_id)
        REFERENCES project_attachment(project_attachment_id);
    ALTER TABLE project_report_persecution ADD CONSTRAINT "Refproject_report_attachment226" 
        FOREIGN KEY (project_report_attachment_id)
        REFERENCES project_report_attachment(project_report_attachment_id);
    ALTER TABLE project_report_proprietary ADD CONSTRAINT "Refproject_report_attachment224" 
        FOREIGN KEY (project_report_attachment_id)
        REFERENCES project_report_attachment(project_report_attachment_id);
    ALTER TABLE survey_attachment_persecution ADD CONSTRAINT "Refsurvey_attachment228" 
        FOREIGN KEY (survey_attachment_id)
        REFERENCES survey_attachment(survey_attachment_id);
    ALTER TABLE survey_attachment_proprietary ADD CONSTRAINT "Refsurvey_attachment227" 
        FOREIGN KEY (survey_attachment_id)
        REFERENCES survey_attachment(survey_attachment_id);
    ALTER TABLE survey_report_persecution ADD CONSTRAINT "Refsurvey_report_attachment230" 
        FOREIGN KEY (survey_report_attachment_id)
        REFERENCES survey_report_attachment(survey_report_attachment_id);
    ALTER TABLE survey_report_proprietary ADD CONSTRAINT "Refsurvey_report_attachment229" 
        FOREIGN KEY (survey_report_attachment_id)
        REFERENCES survey_report_attachment(survey_report_attachment_id);

    ALTER TABLE survey_occurrence_proprietary ADD CONSTRAINT "Refsurvey231" 
        FOREIGN KEY (survey_id)
        REFERENCES survey(survey_id);

    create trigger audit_project_attachment_persecution before insert or update or delete on biohub.project_attachment_persecution for each row execute procedure tr_audit_trigger();
    create trigger audit_project_attachment_proprietary before insert or update or delete on biohub.project_attachment_proprietary for each row execute procedure tr_audit_trigger();
    create trigger audit_project_report_persecution before insert or update or delete on biohub.project_report_persecution for each row execute procedure tr_audit_trigger();
    create trigger audit_project_report_proprietary before insert or update or delete on biohub.project_report_proprietary for each row execute procedure tr_audit_trigger();
    create trigger audit_survey_attachment_persecution before insert or update or delete on biohub.survey_attachment_persecution for each row execute procedure tr_audit_trigger();
    create trigger audit_survey_attachment_proprietary before insert or update or delete on biohub.survey_attachment_proprietary for each row execute procedure tr_audit_trigger();
    create trigger audit_survey_report_persecution before insert or update or delete on biohub.survey_report_persecution for each row execute procedure tr_audit_trigger();
    create trigger audit_survey_report_proprietary before insert or update or delete on biohub.survey_report_proprietary for each row execute procedure tr_audit_trigger();
    create trigger audit_survey_occurrence_proprietary before insert or update or delete on biohub.survey_occurrence_proprietary for each row execute procedure tr_audit_trigger();

    create trigger journal_project_attachment_persecution after insert or update or delete on biohub.project_attachment_persecution for each row execute procedure tr_journal_trigger();
    create trigger journal_project_attachment_proprietary after insert or update or delete on biohub.project_attachment_proprietary for each row execute procedure tr_journal_trigger();
    create trigger journal_project_report_persecution after insert or update or delete on biohub.project_report_persecution for each row execute procedure tr_journal_trigger();
    create trigger journal_project_report_proprietary after insert or update or delete on biohub.project_report_proprietary for each row execute procedure tr_journal_trigger();
    create trigger journal_survey_attachment_persecution after insert or update or delete on biohub.survey_attachment_persecution for each row execute procedure tr_journal_trigger();
    create trigger journal_survey_attachment_proprietary after insert or update or delete on biohub.survey_attachment_proprietary for each row execute procedure tr_journal_trigger();
    create trigger journal_survey_report_persecution after insert or update or delete on biohub.survey_report_persecution for each row execute procedure tr_journal_trigger();
    create trigger journal_survey_report_proprietary after insert or update or delete on biohub.survey_report_proprietary for each row execute procedure tr_journal_trigger();
    create trigger journal_survey_occurrence_proprietary after insert or update or delete on biohub.survey_occurrence_proprietary for each row execute procedure tr_journal_trigger();

    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};
    create or replace view project_attachment_persecution as select * from ${DB_SCHEMA}.project_attachment_persecution;
    create or replace view project_attachment_proprietary as select * from ${DB_SCHEMA}.project_attachment_proprietary;
    create or replace view project_report_persecution as select * from ${DB_SCHEMA}.project_report_persecution;
    create or replace view project_report_proprietary as select * from ${DB_SCHEMA}.project_report_proprietary;
    create or replace view survey_attachment_persecution as select * from ${DB_SCHEMA}.survey_attachment_persecution;
    create or replace view survey_attachment_proprietary as select * from ${DB_SCHEMA}.survey_attachment_proprietary;
    create or replace view survey_report_persecution as select * from ${DB_SCHEMA}.survey_report_persecution;
    create or replace view survey_report_proprietary as select * from ${DB_SCHEMA}.survey_report_proprietary;
    create or replace view survey as select * from ${DB_SCHEMA}.survey;
    create or replace view survey_occurrence_proprietary as select * from ${DB_SCHEMA}.survey_occurrence_proprietary;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
