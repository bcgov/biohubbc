import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public;

    delete from system_metadata_constant where constant_name  = 'BIOHUB_PROVIDER_URL';

    insert into system_metadata_constant (constant_name, character_value, description) values ('PROVIDER_URL', 'https://sims.nrs.gov.bc.ca', 'The system URL. This value is used in the production of published ecological metadata language files.');
    update system_metadata_constant set character_value  = 'https://sims.nrs.gov.bc.ca' where constant_name in ('SECURITY_PROVIDER_URL', 'TAXONOMIC_PROVIDER_URL');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
