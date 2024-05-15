import { Knex } from 'knex';

/**
 * Create new tables:
 * - environment_quantitative
 * - environment_qualitative
 * - environment_qualitative_option
 * - observation_subcount_quantitative_environment
 * - observation_subcount_qualitative_environment
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Create environment lookup tables
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub, public;

    CREATE TYPE environment_unit AS ENUM (
      'millimeter',
      'centimeter',
      'meter',
      'milligram',
      'gram',
      'kilogram',
      'percent',
      'celsius',
      'ppt',
      'SCF',
      'degrees',
      'pH'
    );

    ----------------------------------------------------------------------------------------

    CREATE TABLE environment_quantitative (
      environment_quantitative_id    uuid               DEFAULT public.gen_random_uuid(),
      name                           varchar(100)       NOT NULL,
      description                    varchar(250),
      min                            numeric,
      max                            numeric,
      unit                           environment_unit,
      record_end_date                date,
      create_date                    timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                    integer            NOT NULL,
      update_date                    timestamptz(6),
      update_user                    integer,
      revision_count                 integer            DEFAULT 0 NOT NULL,
      CONSTRAINT environment_quantitative_pk PRIMARY KEY (environment_quantitative_id)
    );

    COMMENT ON TABLE  environment_quantitative                                IS 'Quantitative environment attributes.';
    COMMENT ON COLUMN environment_quantitative.environment_quantitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN environment_quantitative.name                           IS 'The name of the environment attribute.';
    COMMENT ON COLUMN environment_quantitative.description                    IS 'The description of the environment attribute.';
    COMMENT ON COLUMN environment_quantitative.min                            IS 'The minimum allowed value (inclusive).';
    COMMENT ON COLUMN environment_quantitative.max                            IS 'The maximum allowed value (inclusive).';
    COMMENT ON COLUMN environment_quantitative.unit                           IS 'The unit of measure for the value.';
    COMMENT ON COLUMN environment_quantitative.record_end_date                IS 'Record level end date.';
    COMMENT ON COLUMN environment_quantitative.create_date                    IS 'The datetime the record was created.';
    COMMENT ON COLUMN environment_quantitative.create_user                    IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN environment_quantitative.update_date                    IS 'The datetime the record was updated.';
    COMMENT ON COLUMN environment_quantitative.update_user                    IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN environment_quantitative.revision_count                 IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX environment_quantitative_nuk1 ON environment_quantitative(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    ----------------------------------------------------------------------------------------

    CREATE TABLE environment_qualitative (
      environment_qualitative_id           uuid               DEFAULT public.gen_random_uuid(),
      name                                 varchar(100)       NOT NULL,
      description                          varchar(400),
      record_end_date                      date,
      create_date                          timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                          integer            NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer            DEFAULT 0 NOT NULL,
      CONSTRAINT environment_qualitative_pk PRIMARY KEY (environment_qualitative_id)
    );

    COMMENT ON TABLE  environment_qualitative                               IS 'Qualitative environment attributes.';
    COMMENT ON COLUMN environment_qualitative.environment_qualitative_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN environment_qualitative.name                          IS 'The name of the environment attribute.';
    COMMENT ON COLUMN environment_qualitative.description                   IS 'The description of the environment attribute.';
    COMMENT ON COLUMN environment_qualitative.record_end_date               IS 'Record level end date.';
    COMMENT ON COLUMN environment_qualitative.create_date                   IS 'The datetime the record was created.';
    COMMENT ON COLUMN environment_qualitative.create_user                   IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN environment_qualitative.update_date                   IS 'The datetime the record was updated.';
    COMMENT ON COLUMN environment_qualitative.update_user                   IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN environment_qualitative.revision_count                IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
    CREATE UNIQUE INDEX environment_qualitative_nuk1 ON environment_qualitative(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    ----------------------------------------------------------------------------------------

    CREATE TABLE environment_qualitative_option (
      environment_qualitative_option_id    uuid               DEFAULT public.gen_random_uuid(),
      environment_qualitative_id           uuid               NOT NULL,
      name                                 varchar(100)       NOT NULL,
      description                          varchar(400),
      record_end_date                      date,
      create_date                          timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                          integer            NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer            DEFAULT 0 NOT NULL,
      CONSTRAINT environment_qualitative_option_pk PRIMARY KEY (environment_qualitative_option_id)
    );

    COMMENT ON TABLE  environment_qualitative_option                                      IS 'Quantitative environment attribute options.';
    COMMENT ON COLUMN environment_qualitative_option.environment_qualitative_option_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN environment_qualitative_option.environment_qualitative_id           IS 'Foreign key to the environment_qualitative table.';
    COMMENT ON COLUMN environment_qualitative_option.name                                 IS 'The name of the option.';
    COMMENT ON COLUMN environment_qualitative_option.description                          IS 'The description of the option.';
    COMMENT ON COLUMN environment_qualitative_option.record_end_date                      IS 'Record level end date.';
    COMMENT ON COLUMN environment_qualitative_option.create_date                          IS 'The datetime the record was created.';
    COMMENT ON COLUMN environment_qualitative_option.create_user                          IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN environment_qualitative_option.update_date                          IS 'The datetime the record was updated.';
    COMMENT ON COLUMN environment_qualitative_option.update_user                          IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN environment_qualitative_option.revision_count                       IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint (don't allow 2 records with the same environment_qualitative_id and name and a NULL record_end_date)
    CREATE UNIQUE INDEX environment_qualitative_option_nuk1 ON environment_qualitative_option(environment_qualitative_id, name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;
    
    -- Add unique composite key constraint
    ALTER TABLE environment_qualitative_option
      ADD CONSTRAINT environment_qualitative_option_uk1
      UNIQUE (environment_qualitative_option_id, environment_qualitative_id);

    ----------------------------------------------------------------------------------------
    -- Create subocunt environment tables
    ----------------------------------------------------------------------------------------

    CREATE TABLE observation_subcount_quantitative_environment (
      observation_subcount_quantitative_environment_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      observation_subcount_id                             integer            NOT NULL,
      environment_quantitative_id                         uuid               NOT NULL,
      value                                               numeric            NOT NULL,
      create_date                                         timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                         integer            NOT NULL,
      update_date                                         timestamptz(6),
      update_user                                         integer,
      revision_count                                      integer            DEFAULT 0 NOT NULL,
      CONSTRAINT observation_subcount_quantitative_environment_pk PRIMARY KEY (observation_subcount_quantitative_environment_id)
    );

    COMMENT ON TABLE  observation_subcount_quantitative_environment                                                     IS 'This table is intended to track quantitative environments applied to a particular observation_subcount.';
    COMMENT ON COLUMN observation_subcount_quantitative_environment.observation_subcount_quantitative_environment_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN observation_subcount_quantitative_environment.observation_subcount_id                             IS 'Foreign key to the observation_subcount table.';
    COMMENT ON COLUMN observation_subcount_quantitative_environment.environment_quantitative_id                         IS 'Foreign key to the environment_quantitative table.';
    COMMENT ON COLUMN observation_subcount_quantitative_environment.value                                               IS 'Quantitative data value.';
    COMMENT ON COLUMN observation_subcount_quantitative_environment.create_date                                         IS 'The datetime the record was created.';
    COMMENT ON COLUMN observation_subcount_quantitative_environment.create_user                                         IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_quantitative_environment.update_date                                         IS 'The datetime the record was updated.';
    COMMENT ON COLUMN observation_subcount_quantitative_environment.update_user                                         IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_quantitative_environment.revision_count                                      IS 'Revision count used for concurrency control.';

    -- Add unique constraint
    CREATE UNIQUE INDEX observation_subcount_quantitative_environment_uk1 ON observation_subcount_quantitative_environment(observation_subcount_id, environment_quantitative_id);

    -- Add foreign key constraint
    ALTER TABLE observation_subcount_quantitative_environment
      ADD CONSTRAINT observation_subcount_quantitative_environment_fk1
      FOREIGN KEY (observation_subcount_id)
      REFERENCES observation_subcount(observation_subcount_id);

    ALTER TABLE observation_subcount_quantitative_environment
      ADD CONSTRAINT observation_subcount_quantitative_environment_fk2
      FOREIGN KEY (environment_quantitative_id)
      REFERENCES environment_quantitative(environment_quantitative_id);

    -- Add indexes for foreign keys
    CREATE INDEX observation_subcount_quantitative_environment_idx1 ON observation_subcount_quantitative_environment(observation_subcount_id);

    CREATE INDEX observation_subcount_quantitative_environment_idx2 ON observation_subcount_quantitative_environment(environment_quantitative_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE observation_subcount_qualitative_environment (
      observation_subcount_qualitative_environment_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      observation_subcount_id                            integer            NOT NULL,
      environment_qualitative_id                         uuid               NOT NULL,
      environment_qualitative_option_id                  uuid               NOT NULL,
      create_date                                        timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                        integer            NOT NULL,
      update_date                                        timestamptz(6),
      update_user                                        integer,
      revision_count                                     integer            DEFAULT 0 NOT NULL,
      CONSTRAINT observation_subcount_qualitative_environment_pk PRIMARY KEY (observation_subcount_qualitative_environment_id)
    );

    COMMENT ON TABLE  observation_subcount_qualitative_environment                                                    IS 'This table is intended to track qualitative environments applied to a particular observation_subcount.';
    COMMENT ON COLUMN observation_subcount_qualitative_environment.observation_subcount_qualitative_environment_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN observation_subcount_qualitative_environment.observation_subcount_id                            IS 'Foreign key to the observation_subcount table.';
    COMMENT ON COLUMN observation_subcount_qualitative_environment.environment_qualitative_id                         IS 'Foreign key to the environment_qualitative table.';
    COMMENT ON COLUMN observation_subcount_qualitative_environment.environment_qualitative_option_id                  IS 'Foreign key to the environment_qualitative_option table.';
    COMMENT ON COLUMN observation_subcount_qualitative_environment.create_date                                        IS 'The datetime the record was created.';
    COMMENT ON COLUMN observation_subcount_qualitative_environment.create_user                                        IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_qualitative_environment.update_date                                        IS 'The datetime the record was updated.';
    COMMENT ON COLUMN observation_subcount_qualitative_environment.update_user                                        IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount_qualitative_environment.revision_count                                     IS 'Revision count used for concurrency control.';

    -- Add unique constraint
    CREATE UNIQUE INDEX observation_subcount_qualitative_environment_uk1 ON observation_subcount_qualitative_environment(observation_subcount_id, environment_qualitative_id, environment_qualitative_option_id);

    -- Add foreign key constraint
    ALTER TABLE observation_subcount_qualitative_environment
      ADD CONSTRAINT observation_subcount_qualitative_environment_fk1
      FOREIGN KEY (observation_subcount_id)
      REFERENCES observation_subcount(observation_subcount_id);

    ALTER TABLE observation_subcount_qualitative_environment
      ADD CONSTRAINT observation_subcount_qualitative_environment_fk2
      FOREIGN KEY (environment_qualitative_id)
      REFERENCES environment_qualitative(environment_qualitative_id);

    ALTER TABLE observation_subcount_qualitative_environment
      ADD CONSTRAINT observation_subcount_qualitative_environment_fk3
      FOREIGN KEY (environment_qualitative_option_id)
      REFERENCES environment_qualitative_option(environment_qualitative_option_id);

    -- Foreign key on both environment_qualitative_id and environment_qualitative_option_id of 
    -- environment_qualitative_option to ensure that the combination of those ids in this table has a valid match.
    ALTER TABLE observation_subcount_qualitative_environment
      ADD CONSTRAINT observation_subcount_qualitative_environment_fk4
      FOREIGN KEY (environment_qualitative_id, environment_qualitative_option_id)
      REFERENCES environment_qualitative_option(environment_qualitative_id, environment_qualitative_option_id);

    -- Add indexes for foreign keys
    CREATE INDEX observation_subcount_qualitative_environment_idx1 ON observation_subcount_qualitative_environment(observation_subcount_id);

    CREATE INDEX observation_subcount_qualitative_environment_idx2 ON observation_subcount_qualitative_environment(environment_qualitative_id);

    CREATE INDEX observation_subcount_qualitative_environment_idx3 ON observation_subcount_qualitative_environment(environment_qualitative_option_id);

    ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_environment_quantitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.environment_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_environment_quantitative AFTER INSERT OR UPDATE OR DELETE ON biohub.environment_quantitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_environment_qualitative BEFORE INSERT OR UPDATE OR DELETE ON biohub.environment_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_environment_qualitative AFTER INSERT OR UPDATE OR DELETE ON biohub.environment_qualitative FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_environment_qualitative_option BEFORE INSERT OR UPDATE OR DELETE ON biohub.environment_qualitative_option FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_environment_qualitative_option AFTER INSERT OR UPDATE OR DELETE ON biohub.environment_qualitative_option FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_observation_subcount_quantitative_environment BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_quantitative_environment FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_subcount_quantitative_environment AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_quantitative_environment FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_observation_subcount_qualitative_environment BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_qualitative_environment FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_subcount_qualitative_environment AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_subcount_qualitative_environment FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW environment_quantitative AS SELECT * FROM biohub.environment_quantitative;

    CREATE OR REPLACE VIEW environment_qualitative AS SELECT * FROM biohub.environment_qualitative;

    CREATE OR REPLACE VIEW environment_qualitative_option AS SELECT * FROM biohub.environment_qualitative_option;

    CREATE OR REPLACE VIEW observation_subcount_quantitative_environment AS SELECT * FROM biohub.observation_subcount_quantitative_environment;

    CREATE OR REPLACE VIEW observation_subcount_qualitative_environment AS SELECT * FROM biohub.observation_subcount_qualitative_environment;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
