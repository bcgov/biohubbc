import { Knex } from 'knex';

/**
 * Add `project_group` tables.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Create tables
    ----------------------------------------------------------------------------------------
    set search_path=biohub;

    CREATE TABLE project_group(
      project_group_id         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                     varchar(100)      NOT NULL,
      description              varchar(3000),
      record_effective_date    date              NOT NULL,
      record_end_date          date,
      create_date              timestamptz(6)    DEFAULT now() NOT NULL,
      create_user              integer           NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_group_pk PRIMARY KEY (project_group_id)
    );
  
    COMMENT ON COLUMN project_group.project_group_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group.name                   IS 'The name of the project group record.';
    COMMENT ON COLUMN project_group.description            IS 'The description of the project group.';
    COMMENT ON COLUMN project_group.record_effective_date  IS 'Record level effective date.';
    COMMENT ON COLUMN project_group.record_end_date        IS 'Record level end date.';
    COMMENT ON COLUMN project_group.create_date            IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_group.create_user            IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_group.update_date            IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_group.update_user            IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_group.revision_count         IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  project_group                        IS 'A group of related projects.';
    
    ----------------------------------------------------------------------------------------

    CREATE TABLE project_group_participation(
      project_group_participation_id       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      project_group_id                     integer           NOT NULL,
      system_user_id                       integer           NOT NULL,
      project_group_participation_role_id  integer           NOT NULL,
      create_date                          timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                          integer           NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_group_participation_pk PRIMARY KEY (project_group_participation_id)
    );

    COMMENT ON COLUMN project_group_participation.project_group_participation_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_participation.project_group_id                     IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_participation.system_user_id                       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_participation.project_group_participation_role_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_participation.create_date                          IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_group_participation.create_user                          IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_participation.update_date                          IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_group_participation.update_user                          IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_participation.revision_count                       IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  project_group_participation                                      IS 'A associative entity that joins project group, system users, and project group roles.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE project_group_participation_role(
      project_group_participation_role_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      project_group_participation_id        integer           NOT NULL,
      project_group_role_id                 integer           NOT NULL,
      create_date                           timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                           integer           NOT NULL,
      update_date                           timestamptz(6),
      update_user                           integer,
      revision_count                        integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_group_participation_role_pk PRIMARY KEY (project_group_participation_role_id)
    );

    COMMENT ON COLUMN project_group_participation_role.project_group_participation_role_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_participation_role.project_group_participation_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_participation_role.project_group_role_id                IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_participation_role.create_date                          IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_group_participation_role.create_user                          IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_participation_role.update_date                          IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_group_participation_role.update_user                          IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_participation_role.revision_count                       IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  project_group_participation_role                                      IS 'A associative entity that joins project group participation and project group role types.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE project_group_role(
      project_group_role_id     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                      varchar(50)       NOT NULL,
      description               varchar(250)      NOT NULL,
      notes                     varchar(3000),
      record_effective_date     date              NOT NULL,
      record_end_date           date,
      create_date               timestamptz(6)    DEFAULT now() NOT NULL,
      create_user               integer           NOT NULL,
      update_date               timestamptz(6),
      update_user               integer,
      revision_count            integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_group_role_pk PRIMARY KEY (project_group_role_id)
    );

    COMMENT ON COLUMN project_group_role.project_group_role_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_role.name                     IS 'The name of the project group role.';
    COMMENT ON COLUMN project_group_role.description              IS 'The description of the project group role.';
    COMMENT ON COLUMN project_group_role.notes                    IS 'Notes associated with the record.';
    COMMENT ON COLUMN project_group_role.record_effective_date    IS 'Record level effective date.';
    COMMENT ON COLUMN project_group_role.record_end_date          IS 'Record level end date.';
    COMMENT ON COLUMN project_group_role.create_date              IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_group_role.create_user              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_role.update_date              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_group_role.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_role.revision_count           IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  project_group_role                          IS 'Project group roles.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE project_group_role_permission(
      project_group_role_permission_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      project_group_role_id              integer           NOT NULL,
      project_group_permission_id        integer           NOT NULL,
      create_date                        timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                        integer           NOT NULL,
      update_date                        timestamptz(6),
      update_user                        integer,
      revision_count                     integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_group_role_permission_pk PRIMARY KEY (project_group_role_permission_id)
    );
  
    COMMENT ON COLUMN project_group_role_permission.project_group_role_permission_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_role_permission.project_group_role_id             IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_role_permission.project_group_permission_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_role_permission.create_date                       IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_group_role_permission.create_user                       IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_role_permission.update_date                       IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_group_role_permission.update_user                       IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_role_permission.revision_count                    IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  project_group_role_permission                                   IS 'A associative entity that joins project group roles and project group permissions.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE project_group_permission(
      project_group_permission_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                          varchar(50)       NOT NULL,
      description                   varchar(250)      NOT NULL,
      notes                         varchar(3000),
      record_effective_date         date              NOT NULL,
      record_end_date               date,
      create_date                   timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                   integer           NOT NULL,
      update_date                   timestamptz(6),
      update_user                   integer,
      revision_count                integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_group_permission_pk PRIMARY KEY (project_group_permission_id)
    );
  
    COMMENT ON COLUMN project_group_permission.project_group_permission_id   IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_permission.name                          IS 'The name of the project group role.';
    COMMENT ON COLUMN project_group_permission.description                   IS 'The description of the project group role.';
    COMMENT ON COLUMN project_group_permission.notes                         IS 'Notes associated with the record.';
    COMMENT ON COLUMN project_group_permission.record_effective_date         IS 'Record level effective date.';
    COMMENT ON COLUMN project_group_permission.record_end_date               IS 'Record level end date.';
    COMMENT ON COLUMN project_group_permission.create_date                   IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_group_permission.create_user                   IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_permission.update_date                   IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_group_permission.update_user                   IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_permission.revision_count                IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  project_group_permission                               IS 'Project group permissions.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE project_group_project(
      project_group_project_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      project_group_id           integer           NOT NULL,
      project_id                 integer           NOT NULL,
      create_date                timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                integer           NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_group_project_pk PRIMARY KEY (project_group_project_id)
    );
  
    COMMENT ON COLUMN project_group_project.project_group_project_id   IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_project.project_group_id           IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_project.project_id                 IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_group_project.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_group_project.create_user                IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_project.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_group_project.update_user                IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_group_project.revision_count             IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  project_group_project                            IS 'A associative entity that joins project group and project.';

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: project_group
    ----------------------------------------------------------------------------------------

    -- Add unique end-date key constraint (don't allow 2 projects with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX project_group_nuk1 ON project_group(name, (record_end_date is NULL)) where record_end_date is null;

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: project_group_participation
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX project_group_participation_uk1 ON project_group_participation(project_group_id, system_user_id, project_group_participation_role_id);

    -- Add foreign key constraint
    ALTER TABLE project_group_participation ADD CONSTRAINT project_group_participation_fk1
      FOREIGN KEY (project_group_id)
      REFERENCES project_group(project_group_id);

    ALTER TABLE project_group_participation ADD CONSTRAINT project_group_participation_fk2
      FOREIGN KEY (system_user_id)
      REFERENCES system_user(system_user_id);

    ALTER TABLE project_group_participation ADD CONSTRAINT project_group_participation_fk3
      FOREIGN KEY (project_group_participation_role_id)
      REFERENCES project_group_participation_role(project_group_participation_role_id);

    -- Add indexes on key columns
    CREATE INDEX project_group_participation_idx1 ON project_group_participation(project_group_id);
  
    CREATE INDEX project_group_participation_idx2 ON project_group_participation(system_user_id);
  
    CREATE INDEX project_group_participation_idx3 ON project_group_participation(project_group_participation_role_id);

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: project_group_participation_role
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX project_group_participation_role_uk1 ON project_group_participation_role(project_group_participation_id, project_group_role_id);

    -- Add foreign key constraint
    ALTER TABLE project_group_participation_role ADD CONSTRAINT project_group_participation_role_fk1
      FOREIGN KEY (project_group_participation_id)
      REFERENCES project_group_participation(project_group_participation_id);

    ALTER TABLE project_group_participation_role ADD CONSTRAINT project_group_participation_role_fk2
      FOREIGN KEY (project_group_role_id)
      REFERENCES project_group_role(project_group_role_id);

    -- Add indexes on key columns
    CREATE INDEX project_group_participation_role_idx1 ON project_group_participation_role(project_group_participation_id);

    CREATE INDEX project_group_participation_role_idx2 ON project_group_participation_role(project_group_role_id);

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: project_group_role
    ----------------------------------------------------------------------------------------

    -- Add unique end-date key constraint (don't allow 2 projects with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX project_group_role_nuk1 ON project_group_role(name, (record_end_date is NULL)) where record_end_date is null;

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: project_group_role_permission
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX project_group_role_permission_uk1 ON project_group_role_permission(project_group_role_id, project_group_permission_id);

    -- Add foreign key constraint
    ALTER TABLE project_group_role_permission ADD CONSTRAINT project_group_role_permission_fk1
      FOREIGN KEY (project_group_role_id)
      REFERENCES project_group_role(project_group_role_id);

    ALTER TABLE project_group_role_permission ADD CONSTRAINT project_group_role_permission_fk2
      FOREIGN KEY (project_group_permission_id)
      REFERENCES project_group_permission(project_group_permission_id);

    -- Add indexes on key columns
    CREATE INDEX project_group_role_permission_idx1 ON project_group_role_permission(project_group_role_id);

    CREATE INDEX project_group_role_permission_idx2 ON project_group_role_permission(project_group_permission_id);

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: project_group_permission
    ----------------------------------------------------------------------------------------

    -- Add unique end-date key constraint (don't allow 2 projects with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX project_group_permission_nuk1 ON project_group_permission(name, (record_end_date is NULL)) where record_end_date is null;

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: project_group_project
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX project_group_project_uk1 ON project_group_project(project_group_id, project_id);

    -- Add foreign key constraint
    ALTER TABLE project_group_project ADD CONSTRAINT project_group_project_fk1
      FOREIGN KEY (project_group_id)
      REFERENCES project_group(project_group_id);

    ALTER TABLE project_group_project ADD CONSTRAINT project_group_project_fk2
      FOREIGN KEY (project_id)
      REFERENCES project(project_id);

    -- Add indexes on key columns
    CREATE INDEX project_group_project_idx1 ON project_group_project(project_group_id);

    CREATE INDEX project_group_project_idx2 ON project_group_project(project_id);

    ----------------------------------------------------------------------------------------
    -- Create audit and journal triggers
    ----------------------------------------------------------------------------------------

    create trigger audit_project_group before insert or update or delete on project_group for each row execute procedure tr_audit_trigger();
    create trigger journal_project_group after insert or update or delete on project_group for each row execute procedure tr_journal_trigger();

    create trigger audit_project_group_participation before insert or update or delete on project_group_participation for each row execute procedure tr_audit_trigger();
    create trigger journal_project_group_participation after insert or update or delete on project_group_participation for each row execute procedure tr_journal_trigger();

    create trigger audit_project_group_participation_role before insert or update or delete on project_group_participation_role for each row execute procedure tr_audit_trigger();
    create trigger journal_project_group_participation_role after insert or update or delete on project_group_participation_role for each row execute procedure tr_journal_trigger();

    create trigger audit_project_group_role before insert or update or delete on project_group_role for each row execute procedure tr_audit_trigger();
    create trigger journal_project_group_role after insert or update or delete on project_group_role for each row execute procedure tr_journal_trigger();

    create trigger audit_project_group_role_permission before insert or update or delete on project_group_role_permission for each row execute procedure tr_audit_trigger();
    create trigger journal_project_group_role_permission after insert or update or delete on project_group_role_permission for each row execute procedure tr_journal_trigger();

    create trigger audit_project_group_permission before insert or update or delete on project_group_permission for each row execute procedure tr_audit_trigger();
    create trigger journal_project_group_permission after insert or update or delete on project_group_permission for each row execute procedure tr_journal_trigger();

    create trigger audit_project_group_project before insert or update or delete on project_group_project for each row execute procedure tr_audit_trigger();
    create trigger journal_project_group_project after insert or update or delete on project_group_project for each row execute procedure tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------

    set search_path=biohub_dapi_v1;

    create or replace view project_group as select * from biohub.project_group;

    create or replace view project_group_participation as select * from biohub.project_group_participation;

    create or replace view project_group_participation_role as select * from biohub.project_group_participation_role;

    create or replace view project_group_role as select * from biohub.project_group_role;

    create or replace view project_group_role_permission as select * from biohub.project_group_role_permission;

    create or replace view project_group_permission as select * from biohub.project_group_permission;

    create or replace view project_group_project as select * from biohub.project_group_project;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
