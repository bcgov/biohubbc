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
  enum COMMON_SURVEY_METHODOLOGY {
    STRATIFIED_RANDOM_BLOCK = 'Stratified Random Block',
    COMPOSITION = 'Composition',
    RECRUITMENT = 'Recruitment'
  }

  enum SPECIES_NAME {
    MOOSE = 'Moose'
  }

  enum TEMPLATE_NAME {
    Moose_SRB_or_Composition_Survey_Skeena = 'Moose_SRB_or_Composition_Survey_Skeena',
    Moose_SRB_or_Composition_Survey_Omineca = 'Moose SRB or Composition Survey Omineca',
    Moose_SRB_or_Composition_Survey_Cariboo = 'Moose SRB or Composition Survey Cariboo'
  }

  const csm1_wld_4147_t1 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm1_wld_4147_t1.json'));
  const row2 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row2.json'));
  // const row3 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row3.json'));
  // const row4 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row4.json'));
  // const row5 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row5.json'));
  // const row6 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row6.json'));
  // const row7 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row7.json'));
  // const row8 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row8.json'));
  // const row9 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row9.json'));
  // const row10 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row10.json'));
  // const row11 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'row11.json'));

  await knex.raw(`


    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;


    update
	    biohub.template_methodology_species tms
    set
	    validation='${csm1_wld_4147_t1}'
    where
	    tms.template_methodology_species_id =
      (select
        template_methodology_species_id
      from
	      template_methodology_species tms
      left join
        common_survey_methodology csm
      ON
	      tms.common_survey_methodology_id = csm.common_survey_methodology_id
      left join
	      wldtaxonomic_units wu
      on
	      tms.wldtaxonomic_units_id = wu.wldtaxonomic_units_id
      left join
	      template t
      on
        tms.template_id = t.template_id
      where
        csm.name = '${COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK}'
      and
        wu.english_name = '${SPECIES_NAME.MOOSE}'
      and
        t.name= '${TEMPLATE_NAME.Moose_SRB_or_Composition_Survey_Skeena}'
);


    update
      biohub.template_methodology_species tms
    set
      validation='${row2}'
    where
      tms.template_methodology_species_id =
      (select
        template_methodology_species_id
      from
        template_methodology_species tms
      left join
        common_survey_methodology csm
      ON
        tms.common_survey_methodology_id = csm.common_survey_methodology_id
      left join
        wldtaxonomic_units wu
      on
        tms.wldtaxonomic_units_id = wu.wldtaxonomic_units_id
      left join
        template t
      on
        tms.template_id = t.template_id
      where
        csm.name = '${COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK}'
      and
        wu.english_name = '${SPECIES_NAME.MOOSE}'
      and
        t.name= '${TEMPLATE_NAME.Moose_SRB_or_Composition_Survey_Omineca}'
);



    set role postgres;
    set search_path = biohub;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`


  `);
}
