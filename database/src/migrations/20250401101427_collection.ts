import { Knex } from 'knex';

/**
 * Create new tables:
 *collection
 *collection audience
 *collection_contents
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
      owner                      integer            NOT NULL,
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
    COMMENT ON COLUMN collection.owner                      IS 'The user id of the owner of the collection.';
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
    -- Create collection audience table
    ----------------------------------------------------------------------------------------

    CREATE TABLE collection_audience (
      collection_audience_id                        integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      collection_id                                 integer            NOT NULL,
      user_id                                       integer            NOT NULL,    
      record_end_date                               date,
      create_date                                   timestamptz(6)       DEFAULT now() NOT NULL,
      create_user                                   integer              NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer              DEFAULT 0 NOT NULL,
      CONSTRAINT collection_audience_id_pk PRIMARY KEY (collection_audience_id),
      CONSTRAINT collection_audience_collection_id_fk FOREIGN KEY (collection_id) REFERENCES collection(collection_id)
    );

    COMMENT ON TABLE  collection_audience                            IS 'Defines the audience for a collection, linking users to collections.';
    COMMENT ON COLUMN collection_audience.collection_audience_id     IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_audience.collection_id              IS 'The ID of the collection this audience entry belongs to.';
    COMMENT ON COLUMN collection_audience.user_id                    IS 'The ID of the user linked to the collection.';
    COMMENT ON COLUMN collection_audience.record_end_date            IS 'Record level end date.';
    COMMENT ON COLUMN collection_audience.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN collection_audience.create_user                IS 'The ID of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN collection_audience.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN collection_audience.update_user                IS 'The ID of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN collection_audience.revision_count             IS 'Revision count used for concurrency control.';

    CREATE UNIQUE INDEX collection_audience_nuk1 ON collection_audience(collection_id, user_id, (record_end_date IS NULL)) WHERE record_end_date IS NULL;



    ----------------------------------------------------------------------------------------
    -- Create collection contents table
    ----------------------------------------------------------------------------------------

    CREATE TABLE collection_contents (
      collection_contents_id                       integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      collection_id                                integer            NOT NULL,
      survey_id                                    integer            NOT NULL,
      record_end_date                              date,
      create_date                                  timestamptz(6)       DEFAULT now() NOT NULL,
      create_user                                  integer              NOT NULL,
      update_date                                  timestamptz(6),
      update_user                                  integer,
      revision_count                               integer              DEFAULT 0 NOT NULL,
      CONSTRAINT collection_contents_id_pk PRIMARY KEY (collection_contents_id),
      CONSTRAINT collection_contents_collection_id_fk FOREIGN KEY (collection_id) REFERENCES collection(collection_id)
    );

    COMMENT ON TABLE  collection_contents                            IS 'Contents of a collection, linking surveys to collections.';
    COMMENT ON COLUMN collection_contents.collection_contents_id     IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN collection_contents.collection_id              IS 'The ID of the collection this content belongs to.';
    COMMENT ON COLUMN collection_contents.survey_id                  IS 'The ID of the survey linked to the collection.';
    COMMENT ON COLUMN collection_contents.record_end_date            IS 'Record level end date.';
    COMMENT ON COLUMN collection_contents.create_date                IS 'The datetime the record was created.';
    COMMENT ON COLUMN collection_contents.create_user                IS 'The ID of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN collection_contents.update_date                IS 'The datetime the record was updated.';
    COMMENT ON COLUMN collection_contents.update_user                IS 'The ID of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN collection_contents.revision_count             IS 'Revision count used for concurrency control.';
 
  -- Add unique end-date key constraint
  CREATE UNIQUE INDEX collection_contents_nuk1 ON collection_contents(collection_id, survey_id, (record_end_date IS NULL)) WHERE record_end_date IS NULL;

   `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(``);
  }






































