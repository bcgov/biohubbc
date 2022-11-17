import { deerAerialNonSRBRecruitCompJSON } from './deer_aerial_non_srb_recruit_comp_survey';
import { deerGroundTransectRecruitCompJSON } from './deer_ground_transect_recruit_comp_survey';
import { elkAerialTransectDistanceJSON } from './elk_aerial_transect_distance_1';
import { elkNonSRBJSON } from './elk_non_srb_survey';
import { elkSRBJSON } from './elk_srb_survey';
import { goatCompositionOrRecruitmentJSON } from './goat_composition_or_recruitment_2';
import { goatRecruitmentCompositionJSON } from './goat_population_recruitment_composition_survey_1';
import { mooseCompositionJSON } from './moose_composition_survey_1';
import { mooseSRBOrCompositionJSON } from './moose_srb_or_composition_survey_6';
import { mooseSrbJSON } from './moose_srb_survey_1';
import { mooseSummary } from './moose_summary_results_1';
import { mooseTransectDistanceJSON } from './moose_transect_distance_survey_1';
import { sheepCompositionOrRecruitmentJSON } from './sheep_composition_or_recruitment_3';
import { sheepRecruitmentCompositionJSON } from './sheep_population_recruitment_composition_survey_1';

export default {
  ...deerAerialNonSRBRecruitCompJSON,
  ...deerGroundTransectRecruitCompJSON,
  ...elkAerialTransectDistanceJSON,
  ...elkNonSRBJSON,
  ...elkSRBJSON,
  ...goatCompositionOrRecruitmentJSON,
  ...goatRecruitmentCompositionJSON,
  ...mooseCompositionJSON,
  ...mooseSRBOrCompositionJSON,
  ...mooseSrbJSON,
  ...mooseSummary,
  ...mooseTransectDistanceJSON,
  ...sheepCompositionOrRecruitmentJSON,
  ...sheepRecruitmentCompositionJSON
};

export const FIELD_SURVEY_METHOD = [
  {
    name: 'Total Count',
    description:
      'They are intended to enumerate all animals using 100% flight coverage of the study area. Alpine areas are usually small, and thus the technique is practical for surveying mountain sheep and goats, and sometimes caribou. '
  },
  {
    name: 'Estimate/Sampled Counts',
    description:
      'They are intended to visually enumerate target species in the study area. The visual count is then corrected for detection probability to give a population size.'
  },
  {
    name: 'Presence/Absence',
    description: 'Determines if a species occurs at a specific location or not.'
  },
  {
    name: 'Classification',
    description: 'Surveys is to provide information on population composition and recruitment.'
  },
  {
    name: 'Pellet/Scat Count',
    description: 'To count the number of pellet and/or scat groups of a species or group of species.'
  },
  {
    name: 'Track Count',
    description:
      'To count the number of tracks of a species or group of species. Example, Generally estimate relative distribution or abundance by strata, and they estimate the significance of differences between strata. A sample unit can be either an individual track observation (for analysis of frequencies) or a length of transect, usually 100m (for analysis of means)'
  },
  {
    name: 'Call Playback',
    description: 'To play prerecorded calls of species and listen for responses.'
  },
  {
    name: 'Wildlife Camera',
    description: 'To use a camera to record individuals or species in the absence of an observer.'
  },
  {
    name: 'Spotlight Count',
    description: 'To use a spotlight to see and identify or count the number of individuals.'
  },
  {
    name: 'Distance Methods',
    description:
      'Uses similar methods to traditional point counts and strip transects, with little increase in effort to obtain estimates. Allows statistically rigorous estimates of population size and survey variance'
  },
  { name: 'DNA - Individual', description: 'To obtain DNA samples from individuals.' },
  { name: 'DNA - Environmental', description: 'To obtain environmental DNA.' },
  {
    name: 'Mark Resight Recapture - Wildlife Camera',
    description:
      'To mark and subsequently resight or recapture individuals by use of a camera to record individuals or species in the absence of an observer.'
  },
  {
    name: 'Mark Resight Recapture - Spotlight Count',
    description:
      'To mark and subsequently resight or recapture individuals by use of a spotlight to see and identify or count the number of individuals.'
  },
  {
    name: 'Mark Resight Recapture - DNA - Individual',
    description: 'To mark and subsequently resight or recapture individuals by obtaining DNA samples from individuals.'
  },
  {
    name: 'Other',
    description:
      'The field method is described in the comments field of the Survey. Note: Describing the data in comments rather than using a predefined code may reduce the clarity and accessibility of data.'
  },
  {
    name: 'Pollard Walk',
    description:
      'The transect protocol involves one observer walking a fixed path at a constant pace, multiple times in a season. Butterflies are counted when they are seen within a prescribed distance from the path, often 2.5 meters on either side of the path, and only when the butterflies are seen in front of, or above, the observer (i.e., no backtracking). A second person may work with the observer to identify and/or photograph insects spotted by the observer. Transects should not change from year to year and ideally should sample a variety of habitats.'
  },
  {
    name: 'Quadrat',
    description: ''
  },
  {
    name: 'Revele',
    description: 'nested quadrats'
  },
  {
    name: 'Intuitive/Random Meander',
    description: ''
  },
  {
    name: 'Belt Transect',
    description: ''
  },
  {
    name: 'Mark Resight Recapture - Telemetry - Individual',
    description: ''
  },
  {
    name: 'Mark Resight Recapture - Trap/Net',
    description: ''
  },
  {
    name: 'NonMark Capture and Release',
    description: ''
  }
];

export const SAMPLING_DESIGN = [
  {
    name: 'Simple Random Sampling',
    description:
      'All sample units in a population have an equal chance of being selected. Example, within a Study Area boundary, coordinates are randomly generated for the locations of carnivore capture (trap) stations.'
  },
  {
    name: 'Systematic Sampling',
    description:
      'When the population of interest can be sampled from a list (e.g., every fifth individual or, of more relevance to species inventory, in a line. Example, survey forest and grassland songbirds with point count method at stations distributed along a transect with random starting poin selected from the line and sampling is repeated at a set distance thereafter. '
  },
  {
    name: 'Stratified Sampling',
    description:
      'Consists of separating the sample population into similar, non-overlapping groups, called strata, and then selecting either a simple random or systematic sample from each strata. It is critical to the success of a stratified design that each strata is homogeneous within, but distinct from, others'
  },
  {
    name: 'Stratified Random Sampling',
    description:
      'A sampling technique in which a population is divided into discrete units called strata based on similar attributes. The researcher randomly selects a small sample size with similar characteristics to represent a population group under study.'
  },
  {
    name: 'Stratified Systematic Sampling',
    description:
      'In systematic sampling, we use a sampling interval rule to select items. Systematic sampling chooses an item after a predetermined interval.'
  },
  {
    name: 'Other',
    description:
      'The sampling design is described in the comments field of the Survey. Note: Describing the data in comments rather than using a predefined code may reduce the clarity and accessibility of data.'
  }
];

export const UNIT_SAMPLED = [
  {
    name: 'Sample Station',
    description:
      'Collection of data at one point in space. Stations may be randomly located, but often they are placed systematically at points separated by standardized distances.'
  },
  {
    name: 'Block',
    description:
      'Sample blocks are used as a means to delineating separate “samples” of the available landscape. The recommended protocol for conducting herd composition surveys are encounter blocks.  The purpose of these surveys is to provide information on population composition and recruitment.'
  },
  { name: 'Line Transect', description: '' },
  { name: 'Encouter Transect', description: '' },
  { name: 'Fix-width Transect', description: '' },
  { name: 'Transect Segment', description: '' }
];

export const INTENDED_OUTCOME = [
  {
    name: 'Habitat Assessment',
    description: 'To assess habitat for its value to wildlife and to record evidence of its usage by wildlife.'
  },
  {
    name: 'Reconnaissance',
    description: 'To provide information for planning another Survey or to informally determine species presence.'
  },
  {
    name: 'Recruitment',
    description:
      'To count or obtain an index of the number of new individuals (e.g., young) that have been added to the population between 2 points in time. For example, a caribou recruitment Survey counts young animals after winter; the young are considered established and contributing to the population.'
  },
  {
    name: 'Population Composition',
    description:
      'To count or obtain an index of the number of individuals in a population belonging to particular age or sex categories. E.g., bull:cow ratio for moose.'
  },
  {
    name: 'Community Composition',
    description:
      'To determine the numbers or proportions of species in an ecological community or geographic area. E.g., relative ground-cover by plant species, relative density of birds of each species in a forest.'
  },
  {
    name: 'Population Count',
    description:
      'To obtain a number that indicates the number of individuals in an area. A population count may be obtained by enumerating every individual in a population (e.g., by doing a census) or by sampling a portion of the population (e.g., stratified random block design, minimum count, targetting known locations) and then adjusting the observed number to estimate the population size.'
  },
  {
    name: 'Population Index',
    description:
      'An index method aims, by using a standard approach, to produce an indirect measurement of the status of the population in the total area. For an index to provide useful management information, data for it must be collected repeatedly over a period of time using exactly the same method each time. Information will give a trend over time. For example, to obtain a relative abundance index by calculating the number of tracks detected per kilometre of transect, or number of detections per hour of surveying.'
  },
  {
    name: 'Mortality',
    description:
      'To count or obtain an index of the number and conditions of dead individuals, and/or the causes of death.'
  },
  {
    name: 'Survival',
    description:
      'To count or obtain an index of the number of individuals in a population that have survived a period between 2 points in time.'
  },
  {
    name: 'Specimen Collection',
    description: 'To collect sample specimens of a species or taxon.'
  },
  {
    name: 'Translocation',
    description: 'To move individuals from one location to another.'
  },
  {
    name: 'Distribution or Range Map',
    description:
      'To determine the manner in which a species (or population or taxon) is spatially arranged, or to define the geographic limits of the species.'
  }
];
