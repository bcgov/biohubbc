import { Knex } from 'knex';

/**
 * Create new tables:
 * collection
 * collection audience AKA collection_system_user
 * collection_contents AKA collection_survey
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Create COLLECTION table
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub,public;

    CREATE TABLE collection (
      collection_id              integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                       varchar(100)       NOT NULL,
      objectives                 varchar(250)       NOT NULL,
      record_end_date            date,
      create_date                timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                integer            NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer            DEFAULT 0 NOT NULL,
      CONSTRAINT collection_id_pk PRIMARY KEY (collection_id)
    );

    COMMENT ON TABLE  collection                            IS 'User created collections of surveys.';
    COMMENT ON COLUMN collection.collection_id              IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection.name                       IS 'The name of the collection.';
    COMMENT ON COLUMN collection.objectives                 IS 'The objectives of the collection.';
    COMMENT ON COLUMN collection.record_end_date            IS 'Record level end date.';
    COMMENT ON COLUMN collection.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN collection.create_user                IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN collection.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN collection.update_user                IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN collection.revision_count             IS 'Revision count used for concurrency control.';

    -- Add unique end-date key constraint
        CREATE UNIQUE INDEX collection_nuk1 ON collection(name, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    -- Add index to support the search for a collection by name	
        CREATE INDEX collection_idx1 ON collection(name);	




    ----------------------------------------------------------------------------------------
    -- Create collection collection_system_user / audience table
    ----------------------------------------------------------------------------------------

    CREATE TABLE collection_system_user (
      collection_system_user_id                     integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      collection_id                                 integer            NOT NULL,
      user_id                                       integer            NOT NULL,
      admin                                         boolean            DEFAULT false NOT NULL,      
      record_end_date                               date,
      create_date                                   timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                   integer            NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer              DEFAULT 0 NOT NULL,
      CONSTRAINT collection_system_user_id_pk PRIMARY KEY (collection_system_user_id),
      CONSTRAINT collection_system_user_collection_id_fk FOREIGN KEY (collection_id) REFERENCES collection(collection_id)
    );

    COMMENT ON TABLE  collection_system_user                            IS 'Defines the system users tied to a collection.';
    COMMENT ON COLUMN collection_system_user.collection_system_user_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_system_user.collection_id              IS 'The ID of the collection this system_user entry belongs to.';
    COMMENT ON COLUMN collection_system_user.user_id                    IS 'The ID of the user linked to the collection.';
    COMMENT ON COLUMN collection_system_user.admin                      IS 'If true, the user is an admin for the collection.';
    COMMENT ON COLUMN collection_system_user.record_end_date            IS 'Record level end date.';
    COMMENT ON COLUMN collection_system_user.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN collection_system_user.create_user                IS 'The ID of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN collection_system_user.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN collection_system_user.update_user                IS 'The ID of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN collection_system_user.revision_count             IS 'Revision count used for concurrency control.';

    CREATE UNIQUE INDEX collection_system_user_nuk1 ON collection_system_user(collection_id, user_id, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

    -- Index on user_id in the collection_system_user table for frequent lookups
    CREATE INDEX collection_system_user_user_id_idx ON collection_system_user(user_id);



    ----------------------------------------------------------------------------------------
    -- Create collection contents table
    ----------------------------------------------------------------------------------------

    CREATE TABLE collection_survey (
      collection_survey_id                         integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      collection_id                                integer            NOT NULL,
      survey_id                                    integer            NOT NULL,
      record_end_date                              date,
      create_date                                  timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                  integer            NOT NULL,
      update_date                                  timestamptz(6),
      update_user                                  integer,
      revision_count                               integer            DEFAULT 0 NOT NULL,
      CONSTRAINT collection_survey_id_pk PRIMARY KEY (collection_survey_id),
      CONSTRAINT collection_survey_collection_id_fk FOREIGN KEY (collection_id) REFERENCES collection(collection_id)
    );

    COMMENT ON TABLE  collection_survey                            IS 'Defines the surveys tied to a collection.';
    COMMENT ON COLUMN collection_survey.collection_survey_id       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_survey.collection_id              IS 'The ID of the collection the survey is linked to.';
    COMMENT ON COLUMN collection_survey.survey_id                  IS 'The ID of the survey linked to the collection.';
    COMMENT ON COLUMN collection_survey.record_end_date            IS 'Record level end date.';
    COMMENT ON COLUMN collection_survey.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN collection_survey.create_user                IS 'The ID of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN collection_survey.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN collection_survey.update_user                IS 'The ID of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN collection_survey.revision_count             IS 'Revision count used for concurrency control.';
 
  -- Add unique end-date key constraint
  CREATE UNIQUE INDEX collection_survey_nuk1 ON collection_survey(collection_id, survey_id, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

  -- Index on survey_id in the collection_survey table for frequent lookups
  CREATE INDEX collection_survey_survey_id_idx ON collection_survey(survey_id);

   `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(``);
  }






































