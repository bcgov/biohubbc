import { Knex } from 'knex';

/**
 * Tables for survey permissions, which will replace project permissions.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=biohub;

    ----------------------------------------------------------------------------------------
    -- MAKE project_id NULLABLE FOR SURVEYS
    ----------------------------------------------------------------------------------------

    ALTER TABLE survey ALTER COLUMN project_id DROP NOT NULL;

    ----------------------------------------------------------------------------------------
    -- SURVEY ROLE
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_role (
        survey_role_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                     varchar(50)       NOT NULL,
        record_effective_date    date              NOT NULL,
        record_end_date          date,
        description              varchar(250)      NOT NULL,
        notes                    varchar(3000),
        create_date              timestamptz(6)    DEFAULT now() NOT NULL,
        create_user              integer           NOT NULL,
        update_date              timestamptz(6),
        update_user              integer,
        revision_count           integer           DEFAULT 0 NOT NULL,
        CONSTRAINT survey_role_pk PRIMARY KEY (survey_role_id)
    );

    COMMENT ON COLUMN survey_role.survey_role_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_role.name IS 'The name of the survey role.';
    COMMENT ON COLUMN survey_role.record_effective_date IS 'Record level effective date.';
    COMMENT ON COLUMN survey_role.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN survey_role.description IS 'Description of the survey role.';
    COMMENT ON COLUMN survey_role.notes IS 'Additional notes for the role.';
    COMMENT ON COLUMN survey_role.create_date IS 'Timestamp when the record was created.';
    COMMENT ON COLUMN survey_role.create_user IS 'User ID who created the record.';
    COMMENT ON COLUMN survey_role.update_date IS 'Timestamp when the record was last updated.';
    COMMENT ON COLUMN survey_role.update_user IS 'User ID who last updated the record.';
    COMMENT ON COLUMN survey_role.revision_count IS 'Revision count for concurrency control.';
    COMMENT ON TABLE survey_role IS 'Survey roles for participants in a survey.';
    
    CREATE UNIQUE INDEX survey_role_nuk1 ON survey_role (name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    create trigger audit_survey_role before insert or update or delete on survey_role for each row execute procedure tr_audit_trigger();
    create trigger journal_survey_role after insert or update or delete on survey_role for each row execute procedure tr_journal_trigger();

    INSERT INTO survey_role (name, description, record_effective_date) 
    VALUES 
      ('Admin', 'Unrestricted access to manage the Survey', NOW()),
      ('Editor', 'Able to edit data', NOW()),
      ('Viewer', 'Only able to view data', NOW());

    ----------------------------------------------------------------------------------------
    -- SURVEY MEMBER TABLE
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_member (
        survey_member_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        survey_id           integer           NOT NULL,               -- Should reference survey table
        system_user_id      integer           NOT NULL,               -- Should reference system user table
        survey_role_id      integer           NOT NULL,               -- Should reference survey_role table
        create_date         timestamptz(6)    DEFAULT now() NOT NULL,
        create_user         integer           NOT NULL,               -- User ID who created the record
        update_date         timestamptz(6),
        update_user         integer,
        revision_count      integer           DEFAULT 0 NOT NULL,
        CONSTRAINT survey_member_pk PRIMARY KEY (survey_member_id),
        CONSTRAINT fk_survey FOREIGN KEY (survey_id) REFERENCES survey(survey_id) ON DELETE CASCADE,
        CONSTRAINT fk_system_user FOREIGN KEY (system_user_id) REFERENCES "system_user"(system_user_id) ON DELETE CASCADE,
        CONSTRAINT fk_survey_role FOREIGN KEY (survey_role_id) REFERENCES survey_role(survey_role_id) ON DELETE CASCADE
    );

    CREATE INDEX survey_member_idx1 ON survey_member (survey_id);
    CREATE INDEX survey_member_idx2 ON survey_member (system_user_id);
    CREATE INDEX survey_member_idx3 ON survey_member (survey_role_id);

    -- A user can only have one role in a survey
    CREATE UNIQUE INDEX survey_member_nuk1 ON survey_member (survey_id, system_user_id);

    COMMENT ON COLUMN survey_member.survey_member_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_member.survey_id IS 'ID of the survey (references survey table).';
    COMMENT ON COLUMN survey_member.system_user_id IS 'ID of the system user (references system_user table).';
    COMMENT ON COLUMN survey_member.survey_role_id IS 'ID of the role in the survey (references survey_role table).';
    COMMENT ON COLUMN survey_member.create_date IS 'Timestamp when the record was created.';
    COMMENT ON COLUMN survey_member.create_user IS 'User ID who created the record.';
    COMMENT ON COLUMN survey_member.update_date IS 'Timestamp when the record was last updated.';
    COMMENT ON COLUMN survey_member.update_user IS 'User ID who last updated the record.';
    COMMENT ON COLUMN survey_member.revision_count IS 'Revision count for concurrency control.';
    COMMENT ON TABLE survey_member IS 'Associative entity linking surveys, users, and roles for survey participants.';

    create trigger audit_survey_member before insert or update or delete on survey_member for each row execute procedure tr_audit_trigger();
    create trigger journal_survey_member after insert or update or delete on survey_member for each row execute procedure tr_journal_trigger();


  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
