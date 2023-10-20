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
    ------------------------------------------------------------------------------------------------------------------
    ------------------------------------------- Project Program setup ------------------------------------------------
    ------------------------------------------------------------------------------------------------------------------
    
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

    -- Add unique end-date key constraint (handles deletions as soft deletes by setting the record_end_date column)
    CREATE UNIQUE INDEX program_nuk1 ON program(name, (record_end_date is NULL)) where record_end_date is null;

    COMMENT ON COLUMN program.program_id IS 'System generated primary key identifier.';
    COMMENT ON COLUMN program.name IS 'Name of the program.';
    COMMENT ON COLUMN program.description IS 'A description of the program.';
    COMMENT ON COLUMN program.record_effective_date IS 'Record level effective date.';
    COMMENT ON COLUMN program.record_end_date IS 'Record level end date.';
    COMMENT ON COLUMN program.create_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN program.create_user IS 'The id of the user who create the record.';
    COMMENT ON COLUMN program.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN program.update_user IS 'The id of the user who updated the record.';
    COMMENT ON COLUMN program.revision_count IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE program IS 'A table for programs and projects.';

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

    -- Add indexes on foreign key columns
    CREATE INDEX project_program_idx1 ON project_program(project_id);
    CREATE INDEX project_program_idx2 ON project_program(program_id);

    -- Add unique key constraint
    CREATE UNIQUE INDEX project_program_uk1 ON project_program(project_id, program_id);

    create trigger audit_program before insert or update or delete on program for each row execute procedure tr_audit_trigger();
    create trigger audit_project_program before insert or update or delete on project_program for each row execute procedure tr_audit_trigger();

    create trigger journal_program after insert or update or delete on program for each row execute procedure tr_journal_trigger();
    create trigger journal_project_program after insert or update or delete on project_program for each row execute procedure tr_journal_trigger();

    set search_path= biohub_dapi_v1;

    create or replace view program as select * from biohub.program;
    create or replace view project_program as select * from biohub.project_program;

    
    ------------------------------------------------------------------------------------------------------------------
    ------------------------------------- Turning Types -> Programs --------------------------------------------------
    ------------------------------------------------------------------------------------------------------------------

    set search_path= biohub, public;
    
    -- Get existing types and insert them into programs
    INSERT INTO program (name, record_effective_date, description, record_end_date)
    SELECT name, record_effective_date, description, record_end_date
    FROM project_type;

    -- with existing projects, find the type then program via name and insert them for the program
    -- ids may not be consistent with a simple insert
    -- an existing type maybe have been deleted so the increment may be off
    INSERT INTO project_program (project_id, program_id)
    SELECT p.project_id, p2.program_id 
    FROM project_type pt, project p, program p2
    WHERE p.project_type_id = pt.project_type_id
    AND p2.name = pt."name"
    AND p2.record_end_date is null;
    
    set search_path= biohub_dapi_v1;
    -- drop old views
    DROP VIEW project;
    DROP VIEW project_type;

    set search_path= biohub, public;
    -- drop old column and table
    ALTER TABLE project DROP COLUMN project_type_id;
    DROP TABLE project_type;
    
    set search_path= biohub_dapi_v1;
    CREATE OR REPLACE VIEW project as select * from biohub.project;
    CREATE OR REPLACE VIEW project_program as select * from biohub.project_program;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
