import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  CREATE INDEX sec_token_user_idx
    ON ${DB_SCHEMA}.security USING btree
    (security_token ASC NULLS LAST, system_user_id ASC NULLS LAST)
    TABLESPACE pg_default;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  drop INDEX sec_token_user_idx;

  `);
}
