import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const VALIDATION_SCHEMAS = 'template_methodology_species_validations';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Populate template validations.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const row1 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row1.json'));
  const row2 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row2.json'));
  const row3 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row3.json'));
  const row4 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row4.json'));
  const row5 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row5.json'));
  const row6 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row6.json'));
  const row7 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row7.json'));
  const row8 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row8.json'));
  const row9 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row9.json'));
  const row10 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row10.json'));
  const row11 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row11.json'));

  await knex.raw(`


    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;


    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row1}' where tms.template_methodology_species_id = 1;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row2}' where tms.template_methodology_species_id = 2;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row3}' where tms.template_methodology_species_id = 3;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row4}' where tms.template_methodology_species_id = 4;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row5}' where tms.template_methodology_species_id = 5;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row6}' where tms.template_methodology_species_id = 6;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row7}' where tms.template_methodology_species_id = 7;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row8}' where tms.template_methodology_species_id = 8;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row9}' where tms.template_methodology_species_id = 9;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row10}' where tms.template_methodology_species_id = 10;
    update ${DB_SCHEMA}.template_methodology_species tms set validation= '${row11}' where tms.template_methodology_species_id = 11;



    set role postgres;
    set search_path = biohub;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`


  `);
}
