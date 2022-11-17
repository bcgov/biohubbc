import { Knex } from 'knex';
import { permutateTemplates } from './common/Utils';
import { deerAerialNonSRBRecruitCompJSON } from './template_methodology_species_validations/20221021/deer_aerial_non_srb_recruit_comp_survey';
import { deerGroundTransectRecruitCompJSON } from './template_methodology_species_validations/20221021/deer_ground_transect_recruit_comp_survey';
import { elkAerialTransectDistanceJSON } from './template_methodology_species_validations/20221021/elk_aerial_transect_distance_1';
import { elkNonSRBJSON } from './template_methodology_species_validations/20221021/elk_non_srb_survey';
import { elkSRBJSON } from './template_methodology_species_validations/20221021/elk_srb_survey';
import { goatRecruitmentCompositionJSON } from './template_methodology_species_validations/20221021/goat_population_recruitment_composition_survey_1';
import { mooseCompositionJSON } from './template_methodology_species_validations/20221021/moose_composition_survey_1';
import { mooseSrbJSON } from './template_methodology_species_validations/20221021/moose_srb_survey_1';
import { mooseTransectDistanceJSON } from './template_methodology_species_validations/20221021/moose_transect_distance_survey_1';
import { sheepRecruitmentCompositionJSON } from './template_methodology_species_validations/20221021/sheep_population_recruitment_composition_survey_1';

const DB_SCHEMA = process.env.DB_SCHEMA;

const taxonIdLists = {
  moose: ['4147', '6897', '6898', '6899'],
  goat: ['4165'],
  sheep: ['474', '475', '476', '4166', '6905', '8619'],
  elk: ['2227', '2228', '4149', '6901'],
  deer: ['478', '6903', '4148', '4150', '8620']
};

/**
 * Populate template validations.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;
  `);

  permutateTemplates(
    knex,
    'Moose Composition Survey',
    [null],
    taxonIdLists.moose,
    JSON.stringify(mooseCompositionJSON)
  );

  permutateTemplates(knex, 'Moose SRB Survey', [null], taxonIdLists.moose, JSON.stringify(mooseSrbJSON));

  permutateTemplates(
    knex,
    'Moose Transect Distance Survey',
    [null],
    taxonIdLists.moose,
    JSON.stringify(mooseTransectDistanceJSON)
  );

  permutateTemplates(
    knex,
    'Sheep Population Total Count Recruitment Composition Survey',
    [null],
    taxonIdLists.sheep,
    JSON.stringify(sheepRecruitmentCompositionJSON)
  );

  permutateTemplates(
    knex,
    'Goat Population Total Count Recruitment Composition Survey',
    [null],
    taxonIdLists.goat,
    JSON.stringify(goatRecruitmentCompositionJSON)
  );

  permutateTemplates(
    knex,
    'Elk Aerial Transect Distance Sampling Recruitment Composition Survey',
    [null],
    taxonIdLists.elk,
    JSON.stringify(elkAerialTransectDistanceJSON)
  );

  permutateTemplates(
    knex,
    'Elk Aerial SRB Recruit Composition Survey',
    [null],
    taxonIdLists.elk,
    JSON.stringify(elkSRBJSON)
  );

  permutateTemplates(
    knex,
    'Elk Aerial Non SRB Recruit Composition Survey',
    [null],
    taxonIdLists.elk,
    JSON.stringify(elkNonSRBJSON)
  );

  permutateTemplates(
    knex,
    'Deer Aerial Non SRB Recruit Composition Survey',
    [null],
    taxonIdLists.deer,
    JSON.stringify(deerAerialNonSRBRecruitCompJSON)
  );

  permutateTemplates(
    knex,
    'Deer Ground Transect Recruit Composition Survey',
    [null],
    taxonIdLists.deer,
    JSON.stringify(deerGroundTransectRecruitCompJSON)
  );
}

/*
  TEMPLATE NAMES:
    Moose SRB or Composition Survey
    Moose Recruitment Survey
    Goat Composition or Recruitment Survey
    Sheep Composition or Recruitment Survey
    Moose Composition Survey
    Moose SRB Survey
    Moose Transect Distance Survey
    Sheep Population Total Count Recruitment Composition Survey
    Goat Population Total Count Recruitment Composition Survey
    Elk Aerial Transect Distance Sampling Recruitment Composition Survey
    Elk Aerial SRB Recruit Composition Survey
    Elk Aerial Non SRB Recruit Composition Survey
    Deer Aerial Non SRB Recruit Composition Survey
    Deer Ground Transect Recruit Composition Survey
*/
export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
