import { Knex } from 'knex';

/**
 * Added new program and project_program for tracking programs (used to be project type)
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -------------------------------------------------------------------------
    -- Create project permission and join table
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub, public;

    CREATE TABLE project_permission(
      project_permission_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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
      CONSTRAINT project_permission_pk PRIMARY KEY (project_permission_id)
    );
  
    COMMENT ON COLUMN project_permission.project_permission_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_permission.name                     IS 'The name of the project permission.';
    COMMENT ON COLUMN project_permission.description              IS 'The description of the project permission.';
    COMMENT ON COLUMN project_permission.notes                    IS 'Notes associated with the record.';
    COMMENT ON COLUMN project_permission.record_effective_date    IS 'Record level effective date.';
    COMMENT ON COLUMN project_permission.record_end_date          IS 'Record level end date.';
    COMMENT ON COLUMN project_permission.create_date              IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_permission.create_user              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_permission.update_date              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_permission.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_permission.revision_count           IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  project_permission                          IS 'Project permissions.';

    CREATE TABLE project_role_permission(
      project_role_permission_id            integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      project_permission_id                 integer           NOT NULL,
      project_role_id                       integer           NOT NULL,
      create_date                           timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                           integer           NOT NULL,
      update_date                           timestamptz(6),
      update_user                           integer,
      revision_count                        integer           DEFAULT 0 NOT NULL,
      CONSTRAINT project_role_permission_pk PRIMARY KEY (project_role_permission_id)
    );

    COMMENT ON COLUMN project_role_permission.project_role_permission_id          IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_role_permission.project_permission_id               IS 'The id of the project permission.';
    COMMENT ON COLUMN project_role_permission.project_role_id                     IS 'The id of the project role.';
    COMMENT ON COLUMN project_role_permission.create_date                         IS 'The datetime the record was created';
    COMMENT ON COLUMN project_role_permission.create_user                         IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_role_permission.update_date                         IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_role_permission.update_user                         IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_role_permission.revision_count                      IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  project_role_permission                                     IS 'A join table for project roles and their permissions.';

    -------------------------------------------------------------------------
    -- Create audit and journal triggers for new tables
    -------------------------------------------------------------------------
    CREATE TRIGGER audit_project_permission BEFORE INSERT OR UPDATE OR DELETE ON project_permission for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_project_permission AFTER INSERT OR UPDATE OR DELETE ON project_permission for each ROW EXECUTE PROCEDURE tr_journal_trigger();
    
    CREATE TRIGGER audit_project_role_permission BEFORE INSERT OR UPDATE OR DELETE ON project_role_permission for each ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_project_role_permission AFTER INSERT OR UPDATE OR DELETE ON project_role_permission for each ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for new tables
    ----------------------------------------------------------------------------------------

    ALTER TABLE project_role_permission ADD CONSTRAINT project_role_permission_fk1 
      FOREIGN KEY (project_permission_id)
      REFERENCES project_permission(project_permission_id);

    ALTER TABLE project_role_permission ADD CONSTRAINT project_role_permission_fk2
      FOREIGN KEY (project_role_id)
      REFERENCES project_role(project_role_id);

    -- Add unique end-date key constraint (don't allow 2 entities with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX project_permission_nuk1 ON project_permission(name, (record_end_date is NULL)) where record_end_date is null;

    -- Add indexes on foreign key columns
    CREATE INDEX project_role_permission_idx1 ON project_role_permission(project_permission_id);
    CREATE INDEX project_role_permission_idx2 ON project_role_permission(project_role_id);

    -------------------------------------------------------------------------
    -- End date old roles
    -------------------------------------------------------------------------
    UPDATE project_role SET record_end_date = NOW();

    -------------------------------------------------------------------------
    -- Add new roles to project_role table
    -------------------------------------------------------------------------
    INSERT INTO project_role (name, record_effective_date, description)
    VALUES 
      ('Coordinator', NOW(), 'The administrative lead of the project.'),
      ('Collaborator', NOW(), 'A participant team member of the project.'),
      ('Observer', NOW(), 'Read only permissions for a project.');

    -------------------------------------------------------------------------
    -- Add new permissions 
    -------------------------------------------------------------------------
    INSERT INTO project_permission (name, record_effective_date, description)
    VALUES 
      ('Coordinator', NOW(), 'The administrative lead of the project.'),
      ('Collaborator', NOW(), 'A participant team member of the project.'),
      ('Observer', NOW(), 'Read only permissions for a project.');

    -------------------------------------------------------------------------
    -- Update existing project_participation with new project roles
    -------------------------------------------------------------------------
    -- process for each update:
    -- select the role id for the old role
    -- select the participation id for a role by name 
    -- update the existing project_participation row for the old role id with the new role id

    UPDATE project_participation as pp SET project_role_id = (
      SELECT pr1.project_role_id 
      FROM project_role pr1
      WHERE pr1.name = 'Coordinator') 
    WHERE pp.project_participation_id IN (
      SELECT pp.project_participation_id
      FROM project_participation pp2 
      LEFT JOIN project_role pr 
        ON pp.project_role_id = pr.project_role_id
      WHERE pr."name" = 'Project Lead'
    );

    UPDATE project_participation as pp SET project_role_id = (
      SELECT pr1.project_role_id 
      FROM project_role pr1
      WHERE pr1.name = 'Collaborator') 
    WHERE pp.project_participation_id IN (
      SELECT pp.project_participation_id
      FROM project_participation pp2 
      LEFT JOIN project_role pr 
        ON pp.project_role_id = pr.project_role_id
      WHERE pr."name" = 'Editor'
    );

    UPDATE project_participation as pp SET project_role_id = (
      SELECT pr1.project_role_id 
      FROM project_role pr1
      WHERE pr1.name = 'Observer') 
    WHERE pp.project_participation_id IN (
      SELECT pp.project_participation_id
      FROM project_participation pp2 
      LEFT JOIN project_role pr 
        ON pp.project_role_id = pr.project_role_id
      WHERE pr."name" = 'Viewer'
    );

    -------------------------------------------------------------------------
    -- Link Permissions and Roles based on name
    -------------------------------------------------------------------------
    INSERT INTO project_role_permission (project_role_id, project_permission_id)
    SELECT pr.project_role_id, pp.project_permission_id 
    FROM project_permission pp, project_role pr 
    WHERE pp.name = pr."name";

    -------------------------------------------------------------------------
    -- Create views
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;
    
    CREATE OR REPLACE VIEW project_permission AS SELECT * FROM biohub.project_permission;
    CREATE OR REPLACE VIEW project_role_permission AS SELECT * FROM biohub.project_role_permission;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
