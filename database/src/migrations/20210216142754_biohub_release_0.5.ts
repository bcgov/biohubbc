import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Apply biohub release 0.5 changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const biohub_tables = fs.readFileSync(path.join(__dirname, '..', 'release.0.5', 'biohub.0.5.sql'));
  const biohub_audit_triggers = fs.readFileSync(path.join(__dirname, '..', 'release.0.5', 'biohub_audit_triggers.sql'));
  const biohub_journal_triggers = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.5', 'biohub_journal_triggers.sql')
  );
  const biohub_dapi_views = fs.readFileSync(path.join(__dirname, '..', 'release.0.5', 'biohub_dapi_views.sql'));

  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    ${biohub_tables}

    ${biohub_audit_triggers}
    ${biohub_journal_triggers}

    ${biohub_dapi_views}
  `);
}

/**
 * Revert biohub release 0.5 changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  const db_setup_down = fs.readFileSync(path.join(__dirname, '..', 'release.0.5', 'db_setup_down.sql'));

  await knex.raw(`
    set search_path = ${DB_SCHEMA};

    ${db_setup_down}
  `);
}
