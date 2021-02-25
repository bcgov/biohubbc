import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Apply biohub release 0.6 changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const biohub_tables = fs.readFileSync(path.join(__dirname, '..', 'release.0.6', 'biohub.0.6.sql'));
  const biohub_audit_triggers = fs.readFileSync(path.join(__dirname, '..', 'release.0.6', 'biohub_audit_triggers.sql'));
  const biohub_journal_triggers = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.6', 'biohub_journal_triggers.sql')
  );
  const populate_first_nations = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.6', 'populate_first_nations.sql')
  );
  const populate_funding_source = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.6', 'populate_funding_source.sql')
  );
  const populate_investment_action_category = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.6', 'populate_investment_action_category.sql')
  );
  const biohub_dapi_views = fs.readFileSync(path.join(__dirname, '..', 'release.0.6', 'biohub_dapi_views.sql'));

  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    ${biohub_tables}

    ${biohub_audit_triggers}
    ${biohub_journal_triggers}

    ${populate_first_nations}
    ${populate_funding_source}
    ${populate_investment_action_category}

    ${biohub_dapi_views}
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
