import { Knex } from 'knex';

/**
 * Enhancement to system user tables to add support for unverified users.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Create tables
    ----------------------------------------------------------------------------------------
    set search_path=biohub;

    CREATE TABLE system_permission(
      system_permission_id       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                       varchar(50)       NOT NULL,
      description                varchar(250)      NOT NULL,
      notes                      varchar(3000),
      record_effective_date      date              NOT NULL,
      record_end_date            date,
      create_date                timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                integer           NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer           DEFAULT 0 NOT NULL,
      CONSTRAINT system_permission_pk PRIMARY KEY (system_permission_id)
    );

    COMMENT ON COLUMN system_permission.system_permission_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN system_permission.name                       IS 'The name of the project system permission role.';
    COMMENT ON COLUMN system_permission.description                IS 'The description of the system permission role.';
    COMMENT ON COLUMN system_permission.notes                      IS 'Notes associated with the record.';
    COMMENT ON COLUMN system_permission.record_effective_date      IS 'Record level effective date.';
    COMMENT ON COLUMN system_permission.record_end_date            IS 'Record level end date.';
    COMMENT ON COLUMN system_permission.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN system_permission.create_user                IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN system_permission.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN system_permission.update_user                IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN system_permission.revision_count             IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  system_permission                            IS 'System role permission.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE system_role_permission(
      system_role_permission_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      system_role_id               integer           NOT NULL,
      system_permission_id         integer           NOT NULL,
      create_date                  timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                  integer           NOT NULL,
      update_date                  timestamptz(6),
      update_user                  integer,
      revision_count               integer           DEFAULT 0 NOT NULL,
      CONSTRAINT system_role_permission_pk PRIMARY KEY (system_role_permission_id)
    );

    COMMENT ON COLUMN system_role_permission.system_role_permission_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN system_role_permission.system_role_id               IS 'Foreign key referencing the system role table.';
    COMMENT ON COLUMN system_role_permission.system_permission_id         IS 'Foreign key referencing the system permission table.';
    COMMENT ON COLUMN system_role_permission.create_date                  IS 'The datetime the record was created.';
    COMMENT ON COLUMN system_role_permission.create_user                  IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN system_role_permission.update_date                  IS 'The datetime the record was updated.';
    COMMENT ON COLUMN system_role_permission.update_user                  IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN system_role_permission.revision_count               IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  system_role_permission                              IS 'A associative entity that joins system role and system permission.';

    ----------------------------------------------------------------------------------------
    -- Alter tables
    ----------------------------------------------------------------------------------------

    -- Note: Include default value temporarily to satisfy existing system_user rows. Default will be removed afterwards.
    alter table system_user
      ADD   COLUMN display_name     varchar(100)   NOT NULL DEFAULT 'default',
      ADD   COLUMN given_name       varchar(100),
      ADD   COLUMN family_name      varchar(100),
      ADD   COLUMN email            varchar(100)   NOT NULL DEFAULT 'default',
      ADD   COLUMN agency           varchar(100),
      ADD   COLUMN notes            varchar(250),
      ALTER COLUMN user_identifier                 DROP NOT NULL;

    COMMENT ON COLUMN system_user.display_name             IS 'The display name of the user (their IDIR/BCeID display name OR their first and last names combined).';
    COMMENT ON COLUMN system_user.given_name               IS 'The given name of the user (often their first name).';
    COMMENT ON COLUMN system_user.family_name              IS 'The family name of the user (often their last name).';
    COMMENT ON COLUMN system_user.email                    IS 'The email address of the user.';
    COMMENT ON COLUMN system_user.agency                   IS 'The agency the user is associated with.';
    COMMENT ON COLUMN system_user.notes                    IS 'Notes associated with the record.';
    COMMENT ON COLUMN system_user.user_identifier          IS 'The identifier of the user (their IDIR/BCeID username)';
    COMMENT ON COLUMN system_user.user_identity_source_id  IS 'Foreign key referencing the user identity source table.';
    COMMENT ON COLUMN system_user.user_guid                IS 'The Keycloak GUID of the user.';

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: system_permission
    ----------------------------------------------------------------------------------------

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX system_permission_nuk1 ON system_permission(name, (record_end_date is NULL)) where record_end_date is null;

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: system_role_permission
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX system_role_permission_uk1 ON system_role_permission(system_role_id, system_permission_id);

    -- Add foreign key constraint
    ALTER TABLE system_role_permission ADD CONSTRAINT system_role_permission_fk1
      FOREIGN KEY (system_role_id)
      REFERENCES system_role(system_role_id);

    ALTER TABLE system_role_permission ADD CONSTRAINT system_role_permission_fk2
      FOREIGN KEY (system_permission_id)
      REFERENCES system_permission(system_permission_id);

    -- Add indexes on key columns
    CREATE INDEX system_role_permission_idx1 ON system_role_permission(system_role_id);

    CREATE INDEX system_role_permission_idx2 ON system_role_permission(system_permission_id);

    ----------------------------------------------------------------------------------------
    -- Create audit and journal triggers
    ----------------------------------------------------------------------------------------

    create trigger audit_system_role_permission before insert or update or delete on system_role_permission for each row execute procedure tr_audit_trigger();
    create trigger journal_system_role_permission after insert or update or delete on system_role_permission for each row execute procedure tr_journal_trigger();

    create trigger audit_system_permission before insert or update or delete on system_permission for each row execute procedure tr_audit_trigger();
    create trigger journal_system_permission after insert or update or delete on system_permission for each row execute procedure tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------

    set search_path=biohub_dapi_v1;

    create or replace view system_permission as select * from biohub.system_permission;

    create or replace view system_role_permission as select * from biohub.system_role_permission;

    create or replace view system_user as select * from biohub.system_user;

    ----------------------------------------------------------------------------------------
    -- Populate Tables
    ----------------------------------------------------------------------------------------

    set search_path=biohub;

    -- Populate new identity source
    INSERT INTO user_identity_source (name, description, notes, record_effective_date) VALUES ('UNVERIFIED', 'UNVERIFIED user source system.', 'A user with no verified IDIR or BCeID information.', now());

    -- Update existing identity source notes
    UPDATE user_identity_source SET notes = 'A internal user. Used only by the Database and API to make certain privileged queries.' where name = 'DATABASE';
    UPDATE user_identity_source SET notes = 'A IDIR user.' where name = 'IDIR';
    UPDATE user_identity_source SET notes = 'A Basic BCeID User.' where name = 'BCEIDBASIC';
    UPDATE user_identity_source SET notes = 'A Business BCeID user.' where name = 'BCEIDBUSINESS';

    -- Populate system permissions
    INSERT INTO system_permission (name, description, notes, record_effective_date) VALUES ('System Administrator', 'Grants root administrative capabilities.', 'A temporary permission while migrating from roles to permissions.', now());
    INSERT INTO system_permission (name, description, notes, record_effective_date) VALUES ('Data Administrator', 'Grants all data administrative capabilities.', 'A temporary permission while migrating from roles to permissions.', now());
    INSERT INTO system_permission (name, description, notes, record_effective_date) VALUES ('Creator', 'Grants the create project capability.', 'A temporary permission while migrating from roles to permissions.', now());

    -- Populate join table, linking system roles to their corresponding system permissions
    INSERT INTO system_role_permission (
      system_role_id,
      system_permission_id
    ) VALUES (
      (select system_role_id from system_role where name = 'System Administrator'),
      (select system_permission_id from system_permission where name = 'System Administrator')
    );
    INSERT INTO system_role_permission (
      system_role_id,
      system_permission_id
    ) VALUES (
      (select system_role_id from system_role where name = 'Data Administrator'),
      (select system_permission_id from system_permission where name = 'Data Administrator')
    );
    INSERT INTO system_role_permission (
      system_role_id,
      system_permission_id
    ) VALUES (
      (select system_role_id from system_role where name = 'Creator'),
      (select system_permission_id from system_permission where name = 'Creator')
    );

    ----------------------------------------------------------------------------------------
    -- Cleanup Temporary Defaults
    ----------------------------------------------------------------------------------------

    -- Note: Removing default value temporarily added to satisfy existing system_user rows.
    alter table system_user
      ALTER COLUMN display_name  DROP DEFAULT,
      ALTER COLUMN email         DROP DEFAULT;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
