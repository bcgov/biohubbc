import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'biohubbc';
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

console.log('DB_SCHEMA ' + DB_SCHEMA);


/**
 * Create the `DB_SCHEMA` schema.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA}, public;
    ALTER SCHEMA ${DB_SCHEMA} OWNER TO ${DB_SCHEMA};
    GRANT ALL ON SCHEMA ${DB_SCHEMA} TO ${DB_SCHEMA};
  `);
}


/**
 * Drop the `DB_SCHEMA` schema.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */

 //TO_DO:  if we want to drop schema, we need to do it from the postgres user.
 //DROP SCHEMA IF EXISTS ${DB_SCHEMA} CASCADE;

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    
  `);
}