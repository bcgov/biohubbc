import { Knex } from 'knex';

/**
 * Drop survey vantage code
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql  
    ----------------------------------------------------------------------------------------
    -- Drop survey vantage
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    DROP VIEW IF EXISTS survey;
    DROP VIEW IF EXISTS vantage;
    DROP VIEW IF EXISTS survey_vantage;

    ----------------------------------------------------------------------------------------
    -- Alter tables/data
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    DROP TABLE survey_vantage;
    DROP TABLE vantage;

    ----------------------------------------------------------------------------------------
    -- Truncate tables because no survey_type data has been meaningful as of the migration date
    ----------------------------------------------------------------------------------------
    DELETE FROM survey_type;
    DELETE FROM survey_intended_outcome;
    DELETE FROM type;
    DELETE FROM intended_outcome;

    ----------------------------------------------------------------------------------------
    -- Update survey type codes
    ----------------------------------------------------------------------------------------
    INSERT INTO 
      type (name, record_effective_date) 
    VALUES 
      ('Telemetry', now()), 
      ('Species observations', now()), 
      ('Animal captures', now()), 
      ('Animal mortalities', now()), 
      ('Habitat features', now());

    ----------------------------------------------------------------------------------------
    -- Update ecological variables (intended outcomes) codes
    ----------------------------------------------------------------------------------------
    INSERT INTO 
      intended_outcome (name, description, record_effective_date) 
    VALUES 
      ('Survival or mortality', 'The survival or mortality of individuals in a population, including causes of death.', now()),
      ('Birth or recruitment', 'The number of individuals born into a population.', now()),
      ('Distribution or dispersal', 'The geographic distribution of one or more populations, including movement and dispersals patterns.', now()),
      ('Population size', 'The abundance or density of one or more populations.', now()),
      ('Population structure', 'The structure or composition of a population.', now()),
      ('Community structure', 'The structure or composition of a community, which includes multiple populations.', now()),
      ('Species diversity', 'The number of species.', now());

    ----------------------------------------------------------------------------------------
    -- Update views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW survey as SELECT * FROM biohub.survey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
