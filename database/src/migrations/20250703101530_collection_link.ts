import { Knex } from 'knex';

/**
 * New table: 
 *  - collecion_link
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

    ----------------------------------------------------------------------------------------
    -- Create collection link table so a user can store and show an external resource in their project
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub;

    CREATE TABLE collection_link (
    collection_link_id       integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(100)       NOT NULL,
    description              varchar(500)      NOT NULL,
    url                      varchar(500)       NOT NULL,
    collection_id            integer            NOT NULL,
    record_end_date          timestamptz(6),
    create_date              timestamptz(6)     DEFAULT now() NOT NULL,
    create_user              integer            NOT NULL,
    update_date              timestamptz(6)     DEFAULT now() NOT NULL,
    update_user              integer,
    revision_count            integer            DEFAULT 0 NOT NULL,
    CONSTRAINT collection_link_id_pk PRIMARY KEY (collection_link_id),
    CONSTRAINT collection_fk1
      FOREIGN KEY (collection_id)
      REFERENCES collection (collection_id)
  );

  COMMENT ON TABLE collection_link IS 'Table to store links to external resources for a collection';
  COMMENT ON COLUMN collection_link.name IS 'The name of the external resource';
  COMMENT ON COLUMN collection_link.description IS 'A description of the external resource';
  COMMENT ON COLUMN collection_link.url IS 'The URL of the external resource';
  COMMENT ON COLUMN collection_link.collection_id IS 'The ID of the collection this link belongs to';
  COMMENT ON COLUMN collection_link.record_end_date IS 'The date the record was ended';
  COMMENT ON COLUMN collection_link.create_date IS 'The date the record was created';
  COMMENT ON COLUMN collection_link.create_user IS 'The user who created the record';

     ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_collection_link BEFORE INSERT OR UPDATE OR DELETE ON biohub.collection_link FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_collection_link AFTER INSERT OR UPDATE OR DELETE ON biohub.collection_link FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE INDEX collection_link_collection_id_idx ON collection_link(collection_id);

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  `);
}
