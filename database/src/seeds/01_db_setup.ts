import Knex from 'knex';
import * as fs from 'fs';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function seed(knex: Knex): Promise<void> {
  const populate_climate_change_initiatives = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.3', 'populate_climate_change_initiatives.sql')
  );
  const populate_management_action_type = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.3', 'populate_management_action_type.sql')
  );
  const populate_land_based_investment_strategy = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.3', 'populate_land_based_investment_strategy.sql')
  );
  const populate_funding_agency = fs.readFileSync(
    path.join(__dirname, '..', 'release.0.3', 'populate_funding_agency.sql')
  );

  // Remove the existing rows from the code tables
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA};

    DELETE FROM climate_change_initiative;
    DELETE FROM management_action_type;
    DELETE FROM land_based_investment_strategy;
    DELETE FROM funding_agency;
  `);

  // Seed the code tables
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA};

    ${populate_climate_change_initiatives}
    ${populate_management_action_type}
    ${populate_land_based_investment_strategy}
    ${populate_funding_agency}
  `);
}
