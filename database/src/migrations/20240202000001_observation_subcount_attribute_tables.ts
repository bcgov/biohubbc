import { Knex } from 'knex';

/**
 * Create new tables:
 * - observation_subcount
 * - subcount_critter
 * - subcount_attribute
 *
 * Create new function/trigger:
 * - tr_observation_subcount_count
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    -------------------------------------------------------------------------
    -- Create tables
    -------------------------------------------------------------------------
    SET search_path = biohub;

    CREATE TABLE observation_subcount(
      observation_subcount_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_observation_id      integer            NOT NULL,
      subcount                   integer            NOT NULL,
      create_date                timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                integer            NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer            DEFAULT 0 NOT NULL,
      CONSTRAINT observation_subcount_pk PRIMARY KEY (observation_subcount_id)
    );

    COMMENT ON COLUMN observation_subcount.observation_subcount_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN observation_subcount.survey_observation_id      IS 'A foreign key pointing to the survey_observation table.';
    COMMENT ON COLUMN observation_subcount.subcount                   IS 'The subcount of the observation.';
    COMMENT ON COLUMN observation_subcount.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN observation_subcount.create_user                IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN observation_subcount.update_user                IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN observation_subcount.revision_count             IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  observation_subcount                            IS 'Defines a subcount (subset) of an observation record.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE subcount_critter(
      subcount_critter_id        integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      observation_subcount_id    integer            NOT NULL,
      critter_id                 integer            NOT NULL,
      create_date                timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                integer            NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer            DEFAULT 0 NOT NULL,
      CONSTRAINT subcount_critter_pk PRIMARY KEY (subcount_critter_id)
    );

    COMMENT ON COLUMN subcount_critter.subcount_critter_id        IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN subcount_critter.observation_subcount_id    IS 'A foreign key pointing to the observation_subcount table.';
    COMMENT ON COLUMN subcount_critter.critter_id                 IS 'A foreign key pointing to the critter table.';
    COMMENT ON COLUMN subcount_critter.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN subcount_critter.create_user                IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN subcount_critter.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN subcount_critter.update_user                IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN subcount_critter.revision_count             IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  subcount_critter                            IS 'Associates an observation subcount record to zero or many critter records.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE subcount_attribute(
      subcount_attribute_id      integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      observation_subcount_id    integer            NOT NULL,
      critterbase_event_id       uuid               NOT NULL,
      create_date                timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                integer            NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer            DEFAULT 0 NOT NULL,
      CONSTRAINT subcount_attribute_pk PRIMARY KEY (subcount_attribute_id)
    );

    COMMENT ON COLUMN subcount_attribute.subcount_attribute_id      IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN subcount_attribute.observation_subcount_id    IS 'A foreign key pointing to the observation_subcount table.';
    COMMENT ON COLUMN subcount_attribute.critterbase_event_id       IS 'The external system id of a Critterbase event, to which Critterbase attribute records are associated.';
    COMMENT ON COLUMN subcount_attribute.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN subcount_attribute.create_user                IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN subcount_attribute.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN subcount_attribute.update_user                IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN subcount_attribute.revision_count             IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  subcount_attribute                            IS 'Tracks an external system id to Critterbase, which tracks the attributes (measurements, etc) associated to the subcount record.';

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: observation_subcount
    ----------------------------------------------------------------------------------------

    -- Add foreign key constraint
    ALTER TABLE observation_subcount ADD CONSTRAINT observation_subcount_fk1
      FOREIGN KEY (survey_observation_id)
      REFERENCES survey_observation(survey_observation_id);

    -- add indexes for foreign keys
    CREATE INDEX observation_subcount_idx1 ON observation_subcount(survey_observation_id);

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: subcount_critter
    ----------------------------------------------------------------------------------------

    -- Add foreign key constraint
    ALTER TABLE subcount_critter ADD CONSTRAINT subcount_critter_fk1
      FOREIGN KEY (observation_subcount_id)
      REFERENCES observation_subcount(observation_subcount_id);

    ALTER TABLE subcount_critter ADD CONSTRAINT subcount_critter_fk2
      FOREIGN KEY (critter_id)
      REFERENCES critter(critter_id);

    -- add indexes for foreign keys
    CREATE INDEX subcount_critter_idx1 ON subcount_critter(observation_subcount_id);

    CREATE INDEX subcount_critter_idx2 ON subcount_critter(critter_id);

    -- Add unique key constraints
    CREATE UNIQUE INDEX subcount_critter_uk1 ON subcount_critter(observation_subcount_id, critter_id);

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: subcount_attribute
    ----------------------------------------------------------------------------------------

    -- Add foreign key constraint
    ALTER TABLE subcount_attribute ADD CONSTRAINT subcount_attribute_fk1
      FOREIGN KEY (observation_subcount_id)
      REFERENCES observation_subcount(observation_subcount_id);

    -- add indexes for foreign keys
    CREATE INDEX subcount_attribute_idx1 ON subcount_attribute(observation_subcount_id);

    -- Add unique key constraint (don't allow 2 entities with the same observation_subcount_id and critterbase_event_id)
    CREATE UNIQUE INDEX subcount_attribute_uk1 ON subcount_attribute(observation_subcount_id, critterbase_event_id);
  
    ----------------------------------------------------------------------------------------
    -- Create audit and journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_observation_subcount BEFORE INSERT OR UPDATE OR DELETE ON biohub.observation_subcount FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_observation_subcount AFTER INSERT OR UPDATE OR DELETE ON biohub.observation_subcount FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_subcount_critter BEFORE INSERT OR UPDATE OR DELETE ON biohub.subcount_critter FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_subcount_critter AFTER INSERT OR UPDATE OR DELETE ON biohub.subcount_critter FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_subcount_attribute BEFORE INSERT OR UPDATE OR DELETE ON biohub.subcount_attribute FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_subcount_attribute AFTER INSERT OR UPDATE OR DELETE ON biohub.subcount_attribute FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();
  
    ----------------------------------------------------------------------------------------
    -- Create constraint triggers
    ----------------------------------------------------------------------------------------

    CREATE OR REPLACE FUNCTION tr_observation_subcount_count() RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY INVOKER
    AS
    $$
    BEGIN
      IF (
        SELECT SUM(subcount) FROM observation_subcount WHERE survey_observation_id = NEW.survey_observation_id
      ) > (
        SELECT count FROM survey_observation WHERE  survey_observation_id = NEW.survey_observation_id
      ) 
      THEN 
        RAISE EXCEPTION 'The combined count in subcount records must not exceed the count in the parent observation record.';
      END IF;
  
      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER check_observation_subcount_count BEFORE INSERT OR UPDATE ON biohub.observation_subcount FOR EACH ROW EXECUTE FUNCTION tr_observation_subcount_count();

    ----------------------------------------------------------------------------------------
    -- Create new views
    ----------------------------------------------------------------------------------------
    SET search_path=biohub_dapi_v1;

    CREATE OR REPLACE VIEW observation_subcount AS SELECT * FROM biohub.observation_subcount;
    CREATE OR REPLACE VIEW subcount_critter AS SELECT * FROM biohub.subcount_critter;
    CREATE OR REPLACE VIEW subcount_attribute AS SELECT * FROM biohub.subcount_attribute;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
