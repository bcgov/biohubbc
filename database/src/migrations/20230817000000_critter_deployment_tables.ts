import { Knex } from 'knex';

/**
 * Added critter and deployment tables.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 *
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Create Critter table
  ----------------------------------------------------------------------------------------
  set search_path=biohub;

  CREATE TABLE critter(
    critter_id               integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_id                integer           NOT NULL,
    critterbase_critter_id   uuid              NOT NULL,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT critter_pk PRIMARY KEY (critter_id)
  );

  COMMENT ON COLUMN critter.critter_id               IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN critter.survey_id                IS 'The id of the survey.';
  COMMENT ON COLUMN critter.critterbase_critter_id   IS 'The external system id of a Critterbase critter.';
  COMMENT ON COLUMN critter.create_date              IS 'The datetime the record was created.';
  COMMENT ON COLUMN critter.create_user              IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN critter.update_date              IS 'The datetime the record was updated.';
  COMMENT ON COLUMN critter.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN critter.revision_count           IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE  critter                          IS 'Information about individual animals associated.';

  -- Add foreign key constraint from child table to parent table on survey_id
  ALTER TABLE critter ADD CONSTRAINT critter_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- Add foreign key index
  CREATE INDEX critter_idx1 ON critter(survey_id);

  -- Add unique constraint
  CREATE UNIQUE INDEX critter_uk1 ON critter(survey_id, critterbase_critter_id);

  -- Create audit and journal triggers
  create trigger audit_critter before insert or update or delete on critter for each row execute procedure tr_audit_trigger();
  create trigger journal_critter after insert or update or delete on critter for each row execute procedure tr_journal_trigger();

  ----------------------------------------------------------------------------------------
  -- Create Deployment table
  ----------------------------------------------------------------------------------------

  CREATE TABLE deployment(
    deployment_id            integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    critter_id               integer           NOT NULL,
    bctw_deployment_id       uuid              NOT NULL,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT deployment_pk PRIMARY KEY (deployment_id)
  );

  COMMENT ON COLUMN deployment.deployment_id            IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN deployment.critter_id               IS 'The id of the critter. Internal Sims id.';
  COMMENT ON COLUMN deployment.bctw_deployment_id       IS 'The external system id of a BCTW deployment / collar->animal assignment.';
  COMMENT ON COLUMN deployment.create_date              IS 'The datetime the record was created.';
  COMMENT ON COLUMN deployment.create_user              IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN deployment.update_date              IS 'The datetime the record was updated.';
  COMMENT ON COLUMN deployment.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN deployment.revision_count           IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE  deployment                          IS 'Information about individual critters associated to specific bctw deployments.';

  -- Add foreign key constraint from child table to parent table on critter_id
  ALTER TABLE deployment ADD CONSTRAINT deployment_fk1
    FOREIGN KEY (critter_id)
    REFERENCES critter(critter_id);

  -- Add foreign key index
  CREATE INDEX deployment_idx1 ON deployment(critter_id);

  -- Add unique constraint
  CREATE UNIQUE INDEX deployment_uk1 ON deployment(critter_id, bctw_deployment_id);

  -- Create audit and journal triggers
  create trigger audit_critter before insert or update or delete on deployment for each row execute procedure tr_audit_trigger();
  create trigger journal_critter after insert or update or delete on deployment for each row execute procedure tr_journal_trigger();

  ----------------------------------------------------------------------------------------
  -- Create views
  ----------------------------------------------------------------------------------------

  set search_path=biohub_dapi_v1;

  create or replace view critter as select * from biohub.critter;
  create or replace view deployment as select * from biohub.deployment;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
