import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Add a new record to the `proprietor_type` lookup table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    insert into proprietor_type (name, record_effective_date, is_first_nation) values ('Awaiting Permit Approval', now(), false);

    set search_path = biohub_dapi_v1;
    set role biohub_api;

    create or replace view proprietor_type as select * from ${DB_SCHEMA}.proprietor_type;

    set role postgres;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
