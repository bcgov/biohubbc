// Simple test to debug ecological units issue
import { PostSurveyToBiohubObject } from './biohub-create';

// Mock survey data
const survey_obj = {
  id: 1,
  uuid: '1',
  survey_name: 'Test Survey',
  project_id: 1,
  progress_id: 1,
  start_date: 'start_date',
  end_date: 'end_date',
  survey_types: [9],
  revision_count: 1,
  geometry: []
};

const survey_purpose_obj = {
  intended_outcome_ids: [1, 2],
  additional_details: 'Test survey objectives',
  revision_count: 1
};

// Focal species data with ecological units
const focalSpecies = {
  focal_species: [
    {
      tsn: 1234,
      scientificName: 'Species 1',
      commonNames: [],
      rank: 'Species',
      kingdom: 'Animalia',
      ecological_units: [
        {
          critterbase_collection_category_id: 'category-1',
          critterbase_collection_unit_id: 'unit-1'
        }
      ]
    },
    {
      tsn: 5678,
      scientificName: 'Species 2',
      commonNames: [],
      rank: 'Species',
      kingdom: 'Animalia',
      ecological_units: [
        {
          critterbase_collection_category_id: 'category-2',
          critterbase_collection_unit_id: 'unit-2'
        }
      ]
    }
  ]
};

// Animal records that match the focal species
const animalRecords = [
  {
    critter_id: 'animal-1',
    animal_id: 'ANIMAL-001',
    itis_tsn: 1234, // Matches first focal species
    critter_comment: 'Test animal 1',
    sex: { label: 'Male' },
    captures: [],
    mortality: null
  },
  {
    critter_id: 'animal-2', 
    animal_id: 'ANIMAL-002',
    itis_tsn: 5678, // Matches second focal species
    critter_comment: 'Test animal 2',
    sex: { label: 'Female' },
    captures: [],
    mortality: null
  }
];

console.log('Creating PostSurveyToBiohubObject with focal species and animals...');
console.log('Focal species:', JSON.stringify(focalSpecies, null, 2));
console.log('Animal records:', JSON.stringify(animalRecords, null, 2));

// Create the object
const data = new PostSurveyToBiohubObject(
  survey_obj,
  survey_purpose_obj,
  [],
  { type: 'FeatureCollection', features: [] },
  [],
  [],
  animalRecords,
  undefined, // observationSigns
  undefined, // environmentDefinitions
  undefined, // measurementDefinitions
  undefined, // samplingSites
  undefined, // samplingPeriods
  undefined, // habitatFeatures
  undefined, // habitatFeatureTypes
  undefined, // telemetryDevices
  undefined, // telemetryDeployments
  undefined, // telemetry
  undefined, // samplingTechniques
  undefined, // deviceMakes
  undefined, // frequencyUnits
  undefined, // partnerships
  focalSpecies, // focalSpecies
  undefined, // surveyLocation
  undefined, // firstNations
  undefined, // strata
  undefined // siteSelectionStrategies
);

console.log('\nResult created!');
console.log('Total child features:', data.child_features.length);

// Find animal features
const animalFeatures = data.child_features.filter((feature) => feature.type === 'animal');
console.log('Animal features found:', animalFeatures.length);

// Check ecological units within animal child features
let totalEcologicalUnits = 0;
animalFeatures.forEach((animalFeature, index) => {
  console.log(`\nAnimal ${index + 1}:`);
  console.log('  GUID:', animalFeature.guid);
  console.log('  TSN:', animalFeature.properties.taxon_id);
  console.log('  Child features:', animalFeature.child_features.length);
  
  const ecologicalUnits = animalFeature.child_features.filter((child) => child.type === 'ecological_unit');
  console.log('  Ecological units:', ecologicalUnits.length);
  
  ecologicalUnits.forEach((unit, unitIndex) => {
    console.log(`    Unit ${unitIndex + 1}:`, unit.properties);
  });
  
  totalEcologicalUnits += ecologicalUnits.length;
});

console.log('\nTotal ecological units:', totalEcologicalUnits);
console.log('Expected: 2');
console.log('Success:', totalEcologicalUnits === 2 ? 'YES' : 'NO');

