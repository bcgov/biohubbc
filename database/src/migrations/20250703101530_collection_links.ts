import { Knex } from 'knex';

/**
 * Table for user-specific survey filters
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=biohub;

    ----------------------------------------------------------------------------------------
    -- COLLECTION LINKS TABLE
    ----------------------------------------------------------------------------------------
        CREATE TABLE collection_links(
        id integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
        name varchar(100) NOT NULL,
        description varchar(500),
        url varchar(500) NOT NULL,
        collection_id integer NOT NULL,
        record_end_date timestamptz(6),
        create_date timestamptz(6) DEFAULT now() NOT NULL,
        create_user integer NOT NULL

  )


  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  `);
}
