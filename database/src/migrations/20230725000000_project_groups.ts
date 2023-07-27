import { Knex } from 'knex';

/**
 * Add `grouping` tables.
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

    CREATE TABLE grouping(
      grouping_id              integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                     varchar(100)      NOT NULL,
      description              varchar(3000),
      record_effective_date    date              NOT NULL,
      record_end_date          date,
      create_date              timestamptz(6)    DEFAULT now() NOT NULL,
      create_user              integer           NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer           DEFAULT 0 NOT NULL,
      CONSTRAINT grouping_pk PRIMARY KEY (grouping_id)
    );
  
    COMMENT ON COLUMN grouping.grouping_id            IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping.name                   IS 'The name of the grouping record.';
    COMMENT ON COLUMN grouping.description            IS 'The description of the grouping.';
    COMMENT ON COLUMN grouping.record_effective_date  IS 'Record level effective date.';
    COMMENT ON COLUMN grouping.record_end_date        IS 'Record level end date.';
    COMMENT ON COLUMN grouping.create_date            IS 'The datetime the record was created.';
    COMMENT ON COLUMN grouping.create_user            IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN grouping.update_date            IS 'The datetime the record was updated.';
    COMMENT ON COLUMN grouping.update_user            IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN grouping.revision_count         IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  grouping                        IS 'A group of related projects.';
    
    ----------------------------------------------------------------------------------------

    CREATE TABLE grouping_participation(
      grouping_participation_id            integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      grouping_id                          integer           NOT NULL,
      system_user_id                       integer           NOT NULL,
      grouping_participation_role_id       integer           NOT NULL,
      create_date                          timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                          integer           NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer           DEFAULT 0 NOT NULL,
      CONSTRAINT grouping_participation_pk PRIMARY KEY (grouping_participation_id)
    );

    COMMENT ON COLUMN grouping_participation.grouping_participation_id            IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_participation.grouping_id                          IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_participation.system_user_id                       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_participation.grouping_participation_role_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_participation.create_date                          IS 'The datetime the record was created.';
    COMMENT ON COLUMN grouping_participation.create_user                          IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_participation.update_date                          IS 'The datetime the record was updated.';
    COMMENT ON COLUMN grouping_participation.update_user                          IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_participation.revision_count                       IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  grouping_participation                                      IS 'A associative entity that joins grouping, system users, and grouping roles.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE grouping_participation_role(
      grouping_participation_role_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      grouping_participation_id        integer           NOT NULL,
      grouping_role_id                 integer           NOT NULL,
      create_date                      timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                      integer           NOT NULL,
      update_date                      timestamptz(6),
      update_user                      integer,
      revision_count                   integer           DEFAULT 0 NOT NULL,
      CONSTRAINT grouping_participation_role_pk PRIMARY KEY (grouping_participation_role_id)
    );

    COMMENT ON COLUMN grouping_participation_role.grouping_participation_role_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_participation_role.grouping_participation_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_participation_role.grouping_role_id                IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_participation_role.create_date                     IS 'The datetime the record was created.';
    COMMENT ON COLUMN grouping_participation_role.create_user                     IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_participation_role.update_date                     IS 'The datetime the record was updated.';
    COMMENT ON COLUMN grouping_participation_role.update_user                     IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_participation_role.revision_count                  IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  grouping_participation_role                                 IS 'A associative entity that joins grouping participation and grouping role types.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE grouping_role(
      grouping_role_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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
      CONSTRAINT grouping_role_pk PRIMARY KEY (grouping_role_id)
    );

    COMMENT ON COLUMN grouping_role.grouping_role_id         IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_role.name                     IS 'The name of the grouping role.';
    COMMENT ON COLUMN grouping_role.description              IS 'The description of the grouping role.';
    COMMENT ON COLUMN grouping_role.notes                    IS 'Notes associated with the record.';
    COMMENT ON COLUMN grouping_role.record_effective_date    IS 'Record level effective date.';
    COMMENT ON COLUMN grouping_role.record_end_date          IS 'Record level end date.';
    COMMENT ON COLUMN grouping_role.create_date              IS 'The datetime the record was created.';
    COMMENT ON COLUMN grouping_role.create_user              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_role.update_date              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN grouping_role.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_role.revision_count           IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  grouping_role                          IS 'grouping roles.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE grouping_role_permission(
      grouping_role_permission_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      grouping_role_id              integer           NOT NULL,
      grouping_permission_id        integer           NOT NULL,
      create_date                   timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                   integer           NOT NULL,
      update_date                   timestamptz(6),
      update_user                   integer,
      revision_count                integer           DEFAULT 0 NOT NULL,
      CONSTRAINT grouping_role_permission_pk PRIMARY KEY (grouping_role_permission_id)
    );
  
    COMMENT ON COLUMN grouping_role_permission.grouping_role_permission_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_role_permission.grouping_role_id             IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_role_permission.grouping_permission_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_role_permission.create_date                  IS 'The datetime the record was created.';
    COMMENT ON COLUMN grouping_role_permission.create_user                  IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_role_permission.update_date                  IS 'The datetime the record was updated.';
    COMMENT ON COLUMN grouping_role_permission.update_user                  IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_role_permission.revision_count               IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  grouping_role_permission                              IS 'A associative entity that joins grouping roles and grouping permissions.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE grouping_permission(
      grouping_permission_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                     varchar(50)       NOT NULL,
      description              varchar(250)      NOT NULL,
      notes                    varchar(3000),
      record_effective_date    date              NOT NULL,
      record_end_date          date,
      create_date              timestamptz(6)    DEFAULT now() NOT NULL,
      create_user              integer           NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer           DEFAULT 0 NOT NULL,
      CONSTRAINT grouping_permission_pk PRIMARY KEY (grouping_permission_id)
    );
  
    COMMENT ON COLUMN grouping_permission.grouping_permission_id   IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_permission.name                     IS 'The name of the grouping role.';
    COMMENT ON COLUMN grouping_permission.description              IS 'The description of the grouping role.';
    COMMENT ON COLUMN grouping_permission.notes                    IS 'Notes associated with the record.';
    COMMENT ON COLUMN grouping_permission.record_effective_date    IS 'Record level effective date.';
    COMMENT ON COLUMN grouping_permission.record_end_date          IS 'Record level end date.';
    COMMENT ON COLUMN grouping_permission.create_date              IS 'The datetime the record was created.';
    COMMENT ON COLUMN grouping_permission.create_user              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_permission.update_date              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN grouping_permission.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_permission.revision_count           IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  grouping_permission                          IS 'Grouping permissions.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE grouping_project(
      grouping_project_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      grouping_id           integer           NOT NULL,
      project_id            integer           NOT NULL,
      create_date           timestamptz(6)    DEFAULT now() NOT NULL,
      create_user           integer           NOT NULL,
      update_date           timestamptz(6),
      update_user           integer,
      revision_count        integer           DEFAULT 0 NOT NULL,
      CONSTRAINT grouping_project_pk PRIMARY KEY (grouping_project_id)
    );
  
    COMMENT ON COLUMN grouping_project.grouping_project_id   IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_project.grouping_id           IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_project.project_id            IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN grouping_project.create_date           IS 'The datetime the record was created.';
    COMMENT ON COLUMN grouping_project.create_user           IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_project.update_date           IS 'The datetime the record was updated.';
    COMMENT ON COLUMN grouping_project.update_user           IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN grouping_project.revision_count        IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  grouping_project                       IS 'A associative entity that joins grouping and project.';

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: grouping
    ----------------------------------------------------------------------------------------

    -- Add unique end-date key constraint (don't allow 2 projects with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX grouping_nuk1 ON grouping(name, (record_end_date is NULL)) where record_end_date is null;

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: grouping_participation
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX grouping_participation_uk1 ON grouping_participation(grouping_id, system_user_id, grouping_participation_role_id);

    -- Add foreign key constraint
    ALTER TABLE grouping_participation ADD CONSTRAINT grouping_participation_fk1
      FOREIGN KEY (grouping_id)
      REFERENCES grouping(grouping_id);

    ALTER TABLE grouping_participation ADD CONSTRAINT grouping_participation_fk2
      FOREIGN KEY (system_user_id)
      REFERENCES system_user(system_user_id);

    ALTER TABLE grouping_participation ADD CONSTRAINT grouping_participation_fk3
      FOREIGN KEY (grouping_participation_role_id)
      REFERENCES grouping_participation_role(grouping_participation_role_id);

    -- Add indexes on key columns
    CREATE INDEX grouping_participation_idx1 ON grouping_participation(grouping_id);
  
    CREATE INDEX grouping_participation_idx2 ON grouping_participation(system_user_id);
  
    CREATE INDEX grouping_participation_idx3 ON grouping_participation(grouping_participation_role_id);

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: grouping_participation_role
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX grouping_participation_role_uk1 ON grouping_participation_role(grouping_participation_id, grouping_role_id);

    -- Add foreign key constraint
    ALTER TABLE grouping_participation_role ADD CONSTRAINT grouping_participation_role_fk1
      FOREIGN KEY (grouping_participation_id)
      REFERENCES grouping_participation(grouping_participation_id);

    ALTER TABLE grouping_participation_role ADD CONSTRAINT grouping_participation_role_fk2
      FOREIGN KEY (grouping_role_id)
      REFERENCES grouping_role(grouping_role_id);

    -- Add indexes on key columns
    CREATE INDEX grouping_participation_role_idx1 ON grouping_participation_role(grouping_participation_id);

    CREATE INDEX grouping_participation_role_idx2 ON grouping_participation_role(grouping_role_id);

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: grouping_role
    ----------------------------------------------------------------------------------------

    -- Add unique end-date key constraint (don't allow 2 projects with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX grouping_role_nuk1 ON grouping_role(name, (record_end_date is NULL)) where record_end_date is null;

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: grouping_role_permission
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX grouping_role_permission_uk1 ON grouping_role_permission(grouping_role_id, grouping_permission_id);

    -- Add foreign key constraint
    ALTER TABLE grouping_role_permission ADD CONSTRAINT grouping_role_permission_fk1
      FOREIGN KEY (grouping_role_id)
      REFERENCES grouping_role(grouping_role_id);

    ALTER TABLE grouping_role_permission ADD CONSTRAINT grouping_role_permission_fk2
      FOREIGN KEY (grouping_permission_id)
      REFERENCES grouping_permission(grouping_permission_id);

    -- Add indexes on key columns
    CREATE INDEX grouping_role_permission_idx1 ON grouping_role_permission(grouping_role_id);

    CREATE INDEX grouping_role_permission_idx2 ON grouping_role_permission(grouping_permission_id);

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: grouping_permission
    ----------------------------------------------------------------------------------------

    -- Add unique end-date key constraint (don't allow 2 projects with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX grouping_permission_nuk1 ON grouping_permission(name, (record_end_date is NULL)) where record_end_date is null;

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: grouping_project
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX grouping_project_uk1 ON grouping_project(grouping_id, project_id);

    -- Add foreign key constraint
    ALTER TABLE grouping_project ADD CONSTRAINT grouping_project_fk1
      FOREIGN KEY (grouping_id)
      REFERENCES grouping(grouping_id);

    ALTER TABLE grouping_project ADD CONSTRAINT grouping_project_fk2
      FOREIGN KEY (project_id)
      REFERENCES project(project_id);

    -- Add indexes on key columns
    CREATE INDEX grouping_project_idx1 ON grouping_project(grouping_id);

    CREATE INDEX grouping_project_idx2 ON grouping_project(project_id);

    ----------------------------------------------------------------------------------------
    -- Create audit and journal triggers
    ----------------------------------------------------------------------------------------

    create trigger audit_grouping before insert or update or delete on grouping for each row execute procedure tr_audit_trigger();
    create trigger journal_grouping after insert or update or delete on grouping for each row execute procedure tr_journal_trigger();

    create trigger audit_grouping_participation before insert or update or delete on grouping_participation for each row execute procedure tr_audit_trigger();
    create trigger journal_grouping_participation after insert or update or delete on grouping_participation for each row execute procedure tr_journal_trigger();

    create trigger audit_grouping_participation_role before insert or update or delete on grouping_participation_role for each row execute procedure tr_audit_trigger();
    create trigger journal_grouping_participation_role after insert or update or delete on grouping_participation_role for each row execute procedure tr_journal_trigger();

    create trigger audit_grouping_role before insert or update or delete on grouping_role for each row execute procedure tr_audit_trigger();
    create trigger journal_grouping_role after insert or update or delete on grouping_role for each row execute procedure tr_journal_trigger();

    create trigger audit_grouping_role_permission before insert or update or delete on grouping_role_permission for each row execute procedure tr_audit_trigger();
    create trigger journal_grouping_role_permission after insert or update or delete on grouping_role_permission for each row execute procedure tr_journal_trigger();

    create trigger audit_grouping_permission before insert or update or delete on grouping_permission for each row execute procedure tr_audit_trigger();
    create trigger journal_grouping_permission after insert or update or delete on grouping_permission for each row execute procedure tr_journal_trigger();

    create trigger audit_grouping_project before insert or update or delete on grouping_project for each row execute procedure tr_audit_trigger();
    create trigger journal_grouping_project after insert or update or delete on grouping_project for each row execute procedure tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------

    set search_path=biohub_dapi_v1;

    create or replace view grouping as select * from biohub.grouping;

    create or replace view grouping_participation as select * from biohub.grouping_participation;

    create or replace view grouping_participation_role as select * from biohub.grouping_participation_role;

    create or replace view grouping_role as select * from biohub.grouping_role;

    create or replace view grouping_role_permission as select * from biohub.grouping_role_permission;

    create or replace view grouping_permission as select * from biohub.grouping_permission;

    create or replace view grouping_project as select * from biohub.grouping_project;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
