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


    CREATE TABLE program (
      program_id              integer                 GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                    varchar(50),
      description             varchar(50),
      record_effective_date   date,
      record_end_date         date,
      create_date             timestamptz(6)          DEFAULT now() NOT NULL,
      create_user             integer                 NOT NULL,
      update_date             timestamptz(6),
      update_user             integer,
      revision_count          integer                 DEFAULT 0 NOT NULL,
      CONSTRAINT program_pk PRIMARY KEY (program_id)
    );

    CREATE TABLE project_program (
        project_program_id  integer                 GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        project_id          integer                 NOT NULL,
        program_id          integer                 NOT NULL,
        create_date         timestamptz(6)          DEFAULT now() NOT NULL,
        create_user         integer                 NOT NULL,
        update_date         timestamptz(6),
        update_user         integer,
        revision_count      integer                 DEFAULT 0 NOT NULL,
        CONSTRAINT project_program_pk PRIMARY KEY (project_program_id)
    );

    COMMENT ON COLUMN project_program.project_program_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN project_program.project_id IS 'A foreign key pointing to the project table.';
    COMMENT ON COLUMN project_program.program_id IS 'A foreign key pointing to the program table.';
    COMMENT ON COLUMN project_program.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN project_program.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN project_program.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN project_program.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN project_program.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE project_program IS 'A join table for programs and projects.';

    ALTER TABLE project_program ADD CONSTRAINT project_program_fk001 FOREIGN KEY (project_id) REFERENCES project (project_id);
    ALTER TABLE project_program ADD CONSTRAINT project_program_fk002 FOREIGN KEY (program_id) REFERENCES program (program_id);

    create trigger audit_program before insert or update or delete on program for each row execute procedure tr_audit_trigger();
    create trigger audit_project_program before insert or update or delete on project_program for each row execute procedure tr_audit_trigger();

    create trigger journal_program after insert or update or delete on program for each row execute procedure tr_journal_trigger();
    create trigger journal_project_program after insert or update or delete on project_program for each row execute procedure tr_journal_trigger();

    set search_path= biohub_dapi_v1;

    create or replace view program as select * from biohub.program;
    create or replace view project_program as select * from biohub.project_program;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
