import { Knex } from 'knex';

/**
 * Create new tables for survey collections, which are generic groups that surveys can be shared to.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

    set search_path=biohub;

    ----------------------------------------------------------------------------------------
    -- Drop old grouping_* tables because collections replaces their function (and these grouping_* tables never got used)
    ----------------------------------------------------------------------------------------
    DROP TABLE IF EXISTS grouping_project CASCADE;
    DROP TABLE IF EXISTS grouping_participation_role CASCADE;
    DROP TABLE IF EXISTS grouping_participation CASCADE;
    DROP TABLE IF EXISTS grouping_project CASCADE;
    DROP TABLE IF EXISTS grouping_permission CASCADE;
    DROP TABLE IF EXISTS grouping_role CASCADE;
    DROP TABLE IF EXISTS grouping_role_permission CASCADE;
    DROP TABLE IF EXISTS grouping CASCADE;

    ----------------------------------------------------------------------------------------
    -- Create collection_* tables
    ----------------------------------------------------------------------------------------

    CREATE TABLE collection(
      collection_id            integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                     varchar(100)      NOT NULL,
      description              varchar(3000),
      create_date              timestamptz(6)    DEFAULT now() NOT NULL,
      create_user              integer           NOT NULL,
      update_date              timestamptz(6),
      update_user              integer,
      revision_count           integer           DEFAULT 0 NOT NULL,
      CONSTRAINT collection_pk PRIMARY KEY (collection_id)
    );
  
    COMMENT ON COLUMN collection.collection_id            IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection.name                   IS 'The name of the collection record.';
    COMMENT ON COLUMN collection.description            IS 'The description of the collection.';
    COMMENT ON COLUMN collection.create_date            IS 'The datetime the record was created.';
    COMMENT ON COLUMN collection.create_user            IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN collection.update_date            IS 'The datetime the record was updated.';
    COMMENT ON COLUMN collection.update_user            IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN collection.revision_count         IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  collection                        IS 'A group of related surveys.';
    
    ----------------------------------------------------------------------------------------

    CREATE TABLE collection_participation(
      collection_participation_id            integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      collection_id                          integer           NOT NULL,
      system_user_id                       integer           NOT NULL,
      collection_role_id                    integer           NOT NULL,
      create_date                          timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                          integer           NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer           DEFAULT 0 NOT NULL,
      CONSTRAINT collection_participation_pk PRIMARY KEY (collection_participation_id)
    );

    COMMENT ON COLUMN collection_participation.collection_participation_id            IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_participation.collection_id                          IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_participation.system_user_id                       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_participation.collection_role_id                   IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_participation.create_date                          IS 'The datetime the record was created.';
    COMMENT ON COLUMN collection_participation.create_user                          IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN collection_participation.update_date                          IS 'The datetime the record was updated.';
    COMMENT ON COLUMN collection_participation.update_user                          IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN collection_participation.revision_count                       IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  collection_participation                                      IS 'A associative entity that joins collection, system users, and collection roles.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE collection_role(
      collection_role_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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
      CONSTRAINT collection_role_pk PRIMARY KEY (collection_role_id)
    );

    COMMENT ON COLUMN collection_role.collection_role_id         IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_role.name                     IS 'The name of the collection role.';
    COMMENT ON COLUMN collection_role.description              IS 'The description of the collection role.';
    COMMENT ON COLUMN collection_role.notes                    IS 'Notes associated with the record.';
    COMMENT ON COLUMN collection_role.record_effective_date    IS 'Record level effective date.';
    COMMENT ON COLUMN collection_role.record_end_date          IS 'Record level end date.';
    COMMENT ON COLUMN collection_role.create_date              IS 'The datetime the record was created.';
    COMMENT ON COLUMN collection_role.create_user              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN collection_role.update_date              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN collection_role.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN collection_role.revision_count           IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  collection_role                          IS 'collection roles.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE collection_survey(
      collection_survey_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      collection_id           integer           NOT NULL,
      survey_id            integer           NOT NULL,
      create_date           timestamptz(6)    DEFAULT now() NOT NULL,
      create_user           integer           NOT NULL,
      update_date           timestamptz(6),
      update_user           integer,
      revision_count        integer           DEFAULT 0 NOT NULL,
      CONSTRAINT collection_survey_pk PRIMARY KEY (collection_survey_id)
    );
  
    COMMENT ON COLUMN collection_survey.collection_survey_id   IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_survey.collection_id           IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_survey.survey_id            IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_survey.create_date           IS 'The datetime the record was created.';
    COMMENT ON COLUMN collection_survey.create_user           IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN collection_survey.update_date           IS 'The datetime the record was updated.';
    COMMENT ON COLUMN collection_survey.update_user           IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN collection_survey.revision_count        IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  collection_survey                       IS 'A associative entity that joins collection and survey.';


    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: collection_participation
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX collection_participation_uk1 ON collection_participation(collection_id, system_user_id);

    -- Add foreign key constraint
    ALTER TABLE collection_participation ADD CONSTRAINT collection_participation_fk1
      FOREIGN KEY (collection_id)
      REFERENCES collection(collection_id);

    ALTER TABLE collection_participation ADD CONSTRAINT collection_participation_fk2
      FOREIGN KEY (system_user_id)
      REFERENCES "system_user"(system_user_id);

    ALTER TABLE collection_participation ADD CONSTRAINT collection_participation_fk3
      FOREIGN KEY (collection_role_id)
      REFERENCES collection_role(collection_role_id);

    -- Add indexes on key columns
    CREATE INDEX collection_participation_idx1 ON collection_participation(collection_id);
  
    CREATE INDEX collection_participation_idx2 ON collection_participation(system_user_id);
  
    CREATE INDEX collection_participation_idx3 ON collection_participation(collection_role_id);

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: collection_role
    ----------------------------------------------------------------------------------------

    -- Add unique end-date key constraint (don't allow 2 surveys with the same name and a NULL record_end_date)
    CREATE UNIQUE INDEX collection_role_nuk1 ON collection_role(name, (record_end_date is NULL)) where record_end_date is null;

    ----------------------------------------------------------------------------------------
    -- Create Indexes and Constraints for table: collection_survey
    ----------------------------------------------------------------------------------------

    -- Add unique key constraint
    CREATE UNIQUE INDEX collection_survey_uk1 ON collection_survey(collection_id, survey_id);

    -- Add foreign key constraint
    ALTER TABLE collection_survey ADD CONSTRAINT collection_survey_fk1
      FOREIGN KEY (collection_id)
      REFERENCES collection(collection_id);

    ALTER TABLE collection_survey ADD CONSTRAINT collection_survey_fk2
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id);

    -- Add indexes on key columns
    CREATE INDEX collection_survey_idx1 ON collection_survey(collection_id);

    CREATE INDEX collection_survey_idx2 ON collection_survey(survey_id);

    ----------------------------------------------------------------------------------------
    -- Create audit and journal triggers
    ----------------------------------------------------------------------------------------

    create trigger audit_collection before insert or update or delete on collection for each row execute procedure tr_audit_trigger();
    create trigger journal_collection after insert or update or delete on collection for each row execute procedure tr_journal_trigger();

    create trigger audit_collection_participation before insert or update or delete on collection_participation for each row execute procedure tr_audit_trigger();
    create trigger journal_collection_participation after insert or update or delete on collection_participation for each row execute procedure tr_journal_trigger();

    create trigger audit_collection_role before insert or update or delete on collection_role for each row execute procedure tr_audit_trigger();
    create trigger journal_collection_role after insert or update or delete on collection_role for each row execute procedure tr_journal_trigger();

    create trigger audit_collection_survey before insert or update or delete on collection_survey for each row execute procedure tr_audit_trigger();
    create trigger journal_collection_survey after insert or update or delete on collection_survey for each row execute procedure tr_journal_trigger();

    ------
    
    INSERT INTO collection_role (name, description, record_effective_date)
    VALUES 
      ('Admin', 'Able to manage members and the collection.', NOW()),
      ('Member', 'Only able to view information.', NOW());

   `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
