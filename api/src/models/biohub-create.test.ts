import { expect } from 'chai';
import { FeatureCollection } from 'geojson';
import { describe } from 'mocha';

import { SurveyObservationRecord } from '../database-models/survey_observation';
import { ICritterDetailed } from '../services/critterbase-service';
import {
  PostSurveyAnimalToBiohubObject,
  PostSurveyEnvironmentalConditionToBiohubObject,
  PostSurveyMarkingToBiohubObject,
  PostSurveyMeasurementToBiohubObject,
  PostSurveyMortalityToBiohubObject,
  PostSurveyObservationToBiohubObject,
  PostSurveyReleaseToBiohubObject,
  PostSurveySubcountToBiohubObject,
  PostSurveySubmissionToBioHubObject,
  PostSurveyToBiohubObject
} from './biohub-create';
import { GetSurveyData, GetSurveyPurposeAndMethodologyData } from './survey-view';

describe('PostSurveyObservationToBiohubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveyObservationToBiohubObject;

    const obj: SurveyObservationRecord = {
      survey_observation_id: 1,
      survey_id: 1,
      survey_sample_period_id: 1,
      latitude: 1,
      longitude: 1,
      count: 1,
      itis_tsn: 1,
      itis_scientific_name: 'itis_scientific_name',
      observation_time: 'observation_time',
      observation_date: 'observation_date',
      observation_sign_id: 1
    };

    const observationSigns = [
      { id: 1, name: 'Tracks', description: 'Animal tracks' },
      { id: 2, name: 'Scat', description: 'Animal droppings' }
    ];

    before(() => {
      data = new PostSurveyObservationToBiohubObject(obj, observationSigns);
    });

    it('sets id', () => {
      expect(data.id).to.equal('1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('species_observation');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        survey_id: 1,
        taxon_id: 1,
        survey_sample_period_id: 1,
        count: 1,
        timestamp: 'observation_dateTobservation_time',
        sign: 'Tracks',
        geometry: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [1, 1]
              },
              properties: {}
            }
          ]
        }
      });
    });

    it('sets child_features to empty array when no environmental data', () => {
      expect(data.child_features).to.eql([]);
    });
  });

  describe('With environmental data', () => {
    let data: PostSurveyObservationToBiohubObject;

    const objWithEnvironments = {
      survey_observation_id: 2,
      survey_id: 1,
      survey_sample_period_id: 1,
      latitude: 2,
      longitude: 2,
      count: 5,
      itis_tsn: 2,
      itis_scientific_name: 'test_species',
      observation_time: '14:30:00',
      observation_date: '2023-09-15',
      observation_sign_id: 2,
      qualitative_environments: [
        {
          observation_environment_qualitative_id: 1,
          environment_qualitative_id: 'env-qual-uuid-1',
          environment_qualitative_option_id: 'env-qual-opt-uuid-1'
        }
      ],
      quantitative_environments: [
        {
          observation_environment_quantitative_id: 1,
          environment_quantitative_id: 'env-quant-uuid-1',
          value: 25.5
        }
      ],
      subcounts: []
    };

    const observationSigns = [
      { id: 1, name: 'Tracks', description: 'Animal tracks' },
      { id: 2, name: 'Scat', description: 'Animal droppings' }
    ];

    before(() => {
      data = new PostSurveyObservationToBiohubObject(objWithEnvironments, observationSigns);
    });

    it('creates environmental condition child features', () => {
      expect(data.child_features).to.have.length(2);

      const qualitativeEnvFeature = data.child_features[0];
      expect(qualitativeEnvFeature.type).to.equal('observation_environmental_condition');
      expect(qualitativeEnvFeature.properties).to.eql({
        environmental_condition: 'env-qual-uuid-1',
        environmental_condition_value: 'env-qual-opt-uuid-1'
      });

      const quantitativeEnvFeature = data.child_features[1];
      expect(quantitativeEnvFeature.type).to.equal('observation_environmental_condition');
      expect(quantitativeEnvFeature.properties).to.eql({
        environmental_condition: 'env-quant-uuid-1',
        environmental_condition_value: '25.5'
      });
    });
  });

  describe('With environmental data and definitions', () => {
    let data: PostSurveyObservationToBiohubObject;

    const objWithEnvironments = {
      survey_observation_id: 3,
      survey_id: 1,
      survey_sample_period_id: 1,
      latitude: 3,
      longitude: 3,
      count: 10,
      itis_tsn: 3,
      itis_scientific_name: 'test_species_with_definitions',
      observation_time: '16:45:00',
      observation_date: '2023-10-01',
      observation_sign_id: 1,
      qualitative_environments: [
        {
          observation_environment_qualitative_id: 2,
          environment_qualitative_id: 'temp-category-uuid',
          environment_qualitative_option_id: 'cold-uuid'
        }
      ],
      quantitative_environments: [
        {
          observation_environment_quantitative_id: 2,
          environment_quantitative_id: 'wind-speed-uuid',
          value: 15.2
        }
      ],
      subcounts: []
    };

    const environmentDefinitions = {
      qualitative_environments: [
        {
          environment_qualitative_id: 'temp-category-uuid',
          name: 'Temperature Category',
          description: 'Categories for temperature ranges' as string | null,
          options: [
            {
              environment_qualitative_option_id: 'cold-uuid',
              environment_qualitative_id: 'temp-category-uuid',
              name: 'Cold',
              description: 'Below 10°C' as string | null
            },
            {
              environment_qualitative_option_id: 'warm-uuid',
              environment_qualitative_id: 'temp-category-uuid',
              name: 'Warm',
              description: '10-25°C' as string | null
            }
          ]
        }
      ],
      quantitative_environments: [
        {
          environment_quantitative_id: 'wind-speed-uuid',
          name: 'Wind Speed',
          description: 'Wind speed measurement' as string | null,
          min: 0 as number | null,
          max: 200 as number | null,
          unit: 'meter' as 'meter'
        }
      ]
    };

    const observationSigns = [{ id: 1, name: 'Tracks', description: 'Animal tracks' }];

    before(() => {
      data = new PostSurveyObservationToBiohubObject(objWithEnvironments, observationSigns, environmentDefinitions);
    });

    it('creates environmental condition child features with human-readable names', () => {
      expect(data.child_features).to.have.length(2);

      const qualitativeEnvFeature = data.child_features[0];
      expect(qualitativeEnvFeature.type).to.equal('observation_environmental_condition');
      expect(qualitativeEnvFeature.properties).to.eql({
        environmental_condition: 'Temperature Category',
        environmental_condition_value: 'Cold'
      });

      const quantitativeEnvFeature = data.child_features[1];
      expect(quantitativeEnvFeature.type).to.equal('observation_environmental_condition');
      expect(quantitativeEnvFeature.properties).to.eql({
        environmental_condition: 'Wind Speed',
        environmental_condition_value: '15.2 meter'
      });
    });
  });

  describe('With subcount data', () => {
    let data: PostSurveyObservationToBiohubObject;

    const objWithSubcounts = {
      survey_observation_id: 4,
      survey_id: 1,
      survey_sample_period_id: 1,
      latitude: 4,
      longitude: 4,
      count: 15,
      itis_tsn: 4,
      itis_scientific_name: 'test_species_with_subcounts',
      observation_time: '12:00:00',
      observation_date: '2023-11-01',
      observation_sign_id: 1,
      subcounts: [
        {
          observation_subcount_id: 1,
          comment: 'Adult males',
          subcount: 5,
          qualitative_measurements: [
            {
              critterbase_taxon_measurement_id: 'measurement-uuid-1',
              critterbase_measurement_qualitative_option_id: 'option-uuid-1'
            }
          ],
          quantitative_measurements: []
        },
        {
          observation_subcount_id: 2,
          comment: 'Juveniles',
          subcount: 10,
          qualitative_measurements: [],
          quantitative_measurements: [
            {
              critterbase_taxon_measurement_id: 'measurement-uuid-2',
              value: 12.5
            }
          ]
        }
      ]
    };

    const measurementDefinitions = {
      qualitative_measurements: [
        {
          itis_tsn: 180543 as number | null,
          taxon_measurement_id: 'measurement-uuid-1',
          measurement_name: 'Age Class',
          measurement_desc: 'Age classification' as string | null,
          options: [
            {
              qualitative_option_id: 'option-uuid-1',
              option_label: 'Adult',
              option_value: 1,
              option_desc: 'Fully grown individual' as string | null
            }
          ]
        }
      ],
      quantitative_measurements: [
        {
          itis_tsn: 180543 as number | null,
          taxon_measurement_id: 'measurement-uuid-2',
          measurement_name: 'Body Weight',
          measurement_desc: 'Weight in kilograms' as string | null,
          min_value: 0 as number | null,
          max_value: 100 as number | null,
          unit: 'kilogram' as 'kilogram' | null
        }
      ]
    };

    const observationSigns = [{ id: 1, name: 'Tracks', description: 'Animal tracks' }];

    before(() => {
      data = new PostSurveyObservationToBiohubObject(
        objWithSubcounts,
        observationSigns,
        undefined,
        measurementDefinitions
      );
    });

    it('creates subcount child features', () => {
      expect(data.child_features).to.have.length(2);

      const firstSubcountFeature = data.child_features[0];
      expect(firstSubcountFeature.type).to.equal('observation_subcount');
      expect(firstSubcountFeature.properties).to.eql({
        measurement_type: 'Age Class',
        measurement_value: 'Adult',
        comment: 'Adult males',
        count: 5
      });

      const secondSubcountFeature = data.child_features[1];
      expect(secondSubcountFeature.type).to.equal('observation_subcount');
      expect(secondSubcountFeature.properties).to.eql({
        measurement_type: 'Body Weight',
        measurement_value: '12.5 kilogram',
        comment: 'Juveniles',
        count: 10
      });
    });
  });
});

describe('PostSurveySubcountToBiohubObject', () => {
  describe('Qualitative measurement subcount', () => {
    let data: PostSurveySubcountToBiohubObject;

    const qualitativeSubcountData = {
      observation_subcount_id: 1,
      comment: 'Adult males with tracking collars',
      subcount: 8,
      qualitative_measurements: [
        {
          critterbase_taxon_measurement_id: 'age-class-uuid',
          critterbase_measurement_qualitative_option_id: 'adult-uuid'
        }
      ],
      quantitative_measurements: []
    };

    const measurementDefinitions = {
      qualitative_measurements: [
        {
          itis_tsn: 180543 as number | null,
          taxon_measurement_id: 'age-class-uuid',
          measurement_name: 'Age Class',
          measurement_desc: 'Age classification',
          options: [
            {
              qualitative_option_id: 'adult-uuid',
              option_label: 'Adult',
              option_value: 1,
              option_desc: 'Mature individual'
            }
          ]
        }
      ],
      quantitative_measurements: []
    };

    before(() => {
      data = new PostSurveySubcountToBiohubObject(qualitativeSubcountData, 0, measurementDefinitions);
    });

    it('sets id', () => {
      expect(data.id).to.equal('subcount-0');
    });

    it('sets type', () => {
      expect(data.type).to.equal('observation_subcount');
    });

    it('sets properties for qualitative measurements', () => {
      expect(data.properties).to.eql({
        measurement_type: 'Age Class',
        measurement_value: 'Adult',
        comment: 'Adult males with tracking collars',
        count: 8
      });
    });

    it('sets empty child_features', () => {
      expect(data.child_features).to.eql([]);
    });
  });

  describe('Quantitative measurement subcount', () => {
    let data: PostSurveySubcountToBiohubObject;

    const quantitativeSubcountData = {
      observation_subcount_id: 2,
      comment: 'Weighed individuals',
      subcount: 3,
      qualitative_measurements: [],
      quantitative_measurements: [
        {
          critterbase_taxon_measurement_id: 'weight-uuid',
          value: 45.7
        }
      ]
    };

    const measurementDefinitions = {
      qualitative_measurements: [],
      quantitative_measurements: [
        {
          itis_tsn: 180701 as number | null,
          taxon_measurement_id: 'weight-uuid',
          measurement_name: 'Body Weight',
          measurement_desc: 'Individual body weight' as string | null,
          min_value: 0 as number | null,
          max_value: 200 as number | null,
          unit: 'kilogram' as 'kilogram' | null
        }
      ]
    };

    before(() => {
      data = new PostSurveySubcountToBiohubObject(quantitativeSubcountData, 1, measurementDefinitions);
    });

    it('sets id', () => {
      expect(data.id).to.equal('subcount-1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('observation_subcount');
    });

    it('sets properties for quantitative measurements', () => {
      expect(data.properties).to.eql({
        measurement_type: 'Body Weight',
        measurement_value: '45.7 kilogram',
        comment: 'Weighed individuals',
        count: 3
      });
    });

    it('sets empty child_features', () => {
      expect(data.child_features).to.eql([]);
    });
  });

  describe('With missing measurement definitions', () => {
    let qualData: PostSurveySubcountToBiohubObject;
    let quantData: PostSurveySubcountToBiohubObject;

    before(() => {
      qualData = new PostSurveySubcountToBiohubObject(
        {
          observation_subcount_id: 3,
          comment: 'Unknown measurement type',
          subcount: 2,
          qualitative_measurements: [
            {
              critterbase_taxon_measurement_id: 'unknown-measurement-uuid',
              critterbase_measurement_qualitative_option_id: 'unknown-option-uuid'
            }
          ],
          quantitative_measurements: []
        },
        0
      );

      quantData = new PostSurveySubcountToBiohubObject(
        {
          observation_subcount_id: 4,
          comment: 'Unknown quantitative measurement',
          subcount: 1,
          qualitative_measurements: [],
          quantitative_measurements: [
            {
              critterbase_taxon_measurement_id: 'unknown-quant-uuid',
              value: 123.4
            }
          ]
        },
        1
      );
    });

    it('uses IDs when measurement names are missing for qualitative', () => {
      expect(qualData.properties).to.eql({
        measurement_type: 'unknown-measurement-uuid',
        measurement_value: 'unknown-option-uuid',
        comment: 'Unknown measurement type',
        count: 2
      });
    });

    it('uses ID and no unit when missing for quantitative', () => {
      expect(quantData.properties).to.eql({
        measurement_type: 'unknown-quant-uuid',
        measurement_value: '123.4',
        comment: 'Unknown quantitative measurement',
        count: 1
      });
    });
  });

  describe('With no measurements', () => {
    let data: PostSurveySubcountToBiohubObject;

    before(() => {
      data = new PostSurveySubcountToBiohubObject(
        {
          observation_subcount_id: 5,
          comment: 'General count',
          subcount: 20,
          qualitative_measurements: [],
          quantitative_measurements: []
        },
        0
      );
    });

    it('uses empty strings when no measurements available', () => {
      expect(data.properties).to.eql({
        measurement_type: '',
        measurement_value: '',
        comment: 'General count',
        count: 20
      });
    });
  });
});

describe('PostSurveyEnvironmentalConditionToBiohubObject', () => {
  describe('Qualitative environmental condition', () => {
    let data: PostSurveyEnvironmentalConditionToBiohubObject;

    const qualitativeEnvData = {
      type: 'qualitative' as const,
      environment_qualitative_id: 'temp-category-uuid',
      environment_qualitative_option_id: 'warm-uuid',
      name: 'Temperature Category',
      option_name: 'Warm'
    };

    before(() => {
      data = new PostSurveyEnvironmentalConditionToBiohubObject(qualitativeEnvData, 0);
    });

    it('sets id', () => {
      expect(data.id).to.equal('environmental-condition-0');
    });

    it('sets type', () => {
      expect(data.type).to.equal('observation_environmental_condition');
    });

    it('sets properties for qualitative data', () => {
      expect(data.properties).to.eql({
        environmental_condition: 'Temperature Category',
        environmental_condition_value: 'Warm'
      });
    });

    it('sets empty child_features', () => {
      expect(data.child_features).to.eql([]);
    });
  });

  describe('Quantitative environmental condition', () => {
    let data: PostSurveyEnvironmentalConditionToBiohubObject;

    const quantitativeEnvData = {
      type: 'quantitative' as const,
      environment_quantitative_id: 'temperature-uuid',
      value: 23.5,
      name: 'Temperature',
      unit: '°C'
    };

    before(() => {
      data = new PostSurveyEnvironmentalConditionToBiohubObject(quantitativeEnvData, 1);
    });

    it('sets id', () => {
      expect(data.id).to.equal('environmental-condition-1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('observation_environmental_condition');
    });

    it('sets properties for quantitative data', () => {
      expect(data.properties).to.eql({
        environmental_condition: 'Temperature',
        environmental_condition_value: '23.5 °C'
      });
    });

    it('sets empty child_features', () => {
      expect(data.child_features).to.eql([]);
    });
  });

  describe('With missing optional fields', () => {
    let qualData: PostSurveyEnvironmentalConditionToBiohubObject;
    let quantData: PostSurveyEnvironmentalConditionToBiohubObject;

    before(() => {
      qualData = new PostSurveyEnvironmentalConditionToBiohubObject(
        {
          type: 'qualitative',
          environment_qualitative_id: 'env-qual-uuid',
          environment_qualitative_option_id: 'env-qual-opt-uuid'
        },
        0
      );

      quantData = new PostSurveyEnvironmentalConditionToBiohubObject(
        {
          type: 'quantitative',
          environment_quantitative_id: 'env-quant-uuid',
          value: 42
        },
        1
      );
    });

    it('uses IDs when names are missing for qualitative', () => {
      expect(qualData.properties).to.eql({
        environmental_condition: 'env-qual-uuid',
        environmental_condition_value: 'env-qual-opt-uuid'
      });
    });

    it('uses ID and no unit when missing for quantitative', () => {
      expect(quantData.properties).to.eql({
        environmental_condition: 'env-quant-uuid',
        environmental_condition_value: '42'
      });
    });
  });
});

describe('PostSurveyAnimalToBiohubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveyAnimalToBiohubObject;

    const obj: ICritterDetailed = {
      critter_id: 'animal-uuid-123',
      wlh_id: 'WLH-123',
      animal_id: 'ANIMAL-456',
      sex: { qualitative_option_id: 'uuid-male', label: 'Male' },
      itis_tsn: 180543,
      itis_scientific_name: 'Ursus arctos',
      critter_comment: 'Large male bear with distinctive ear tags',
      captures: [
        {
          capture_id: 'capture-uuid-1',
          critter_id: 'animal-uuid-123',
          capture_date: '2023-06-15',
          capture_time: '10:30:00',
          capture_comment: 'Initial capture for tagging',
          markings: [],
          quantitative_measurements: [],
          qualitative_measurements: [],
          capture_location: { latitude: 50.1234, longitude: -125.5678 },
          release_location: { latitude: 50.1234, longitude: -125.5678 }
        }
      ],
      mortality: null as any
    };

    before(() => {
      data = new PostSurveyAnimalToBiohubObject(obj);
    });

    it('sets id', () => {
      expect(data.id).to.equal('animal-uuid-123');
    });

    it('sets type', () => {
      expect(data.type).to.equal('animal');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        taxon_id: 180543,
        animal_identifier: 'ANIMAL-456',
        description: 'Large male bear with distinctive ear tags',
        sex: 'Male'
      });
    });

    it('includes captures as child features', () => {
      expect(data.child_features).to.have.length(1);
      expect(data.child_features[0].type).to.equal('capture');
      expect(data.child_features[0].properties).to.eql({
        description: 'Initial capture for tagging',
        timestamp: '2023-06-15T10:30:00',
        geometry: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-125.5678, 50.1234]
              },
              properties: {}
            }
          ]
        }
      });
    });
  });

  describe('Null values provided', () => {
    let data: PostSurveyAnimalToBiohubObject;

    const obj: ICritterDetailed = {
      critter_id: 'animal-uuid-456',
      wlh_id: null,
      animal_id: 'ANIMAL-789',
      sex: null,
      itis_tsn: 180701,
      itis_scientific_name: 'Rangifer tarandus',
      critter_comment: null,
      captures: [],
      mortality: null as any
    };

    before(() => {
      data = new PostSurveyAnimalToBiohubObject(obj);
    });

    it('sets id', () => {
      expect(data.id).to.equal('animal-uuid-456');
    });

    it('sets type', () => {
      expect(data.type).to.equal('animal');
    });

    it('sets properties with null values', () => {
      expect(data.properties).to.eql({
        taxon_id: 180701,
        animal_identifier: 'ANIMAL-789',
        description: null,
        sex: null
      });
    });

    it('has no child features when no captures', () => {
      expect(data.child_features).to.have.length(0);
    });
  });

  describe('With capture and release', () => {
    let data: PostSurveyAnimalToBiohubObject;

    const obj: ICritterDetailed = {
      critter_id: 'animal-uuid-789',
      wlh_id: 'WLH-789',
      animal_id: 'ANIMAL-789',
      sex: { qualitative_option_id: 'uuid-female', label: 'Female' },
      itis_tsn: 180543,
      itis_scientific_name: 'Ursus arctos',
      critter_comment: 'Female bear with capture and release',
      captures: [
        {
          capture_id: 'capture-uuid-2',
          critter_id: 'animal-uuid-789',
          capture_date: '2023-07-10',
          capture_time: '08:15:00',
          capture_comment: 'Capture for research',
          release_date: '2023-07-11',
          release_time: '16:30:00',
          release_comment: 'Released after data collection',
          markings: [],
          quantitative_measurements: [],
          qualitative_measurements: [],
          capture_location: { latitude: 51.2345, longitude: -126.6789 },
          release_location: { latitude: 51.3456, longitude: -126.789 }
        }
      ],
      mortality: null as any
    };

    before(() => {
      data = new PostSurveyAnimalToBiohubObject(obj);
    });

    it('includes both capture and release as child features', () => {
      expect(data.child_features).to.have.length(2);

      // Check capture feature
      const captureFeature = data.child_features.find((f) => f.type === 'capture');
      expect(captureFeature).to.exist;
      expect(captureFeature?.properties).to.eql({
        description: 'Capture for research',
        timestamp: '2023-07-10T08:15:00',
        geometry: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-126.6789, 51.2345]
              },
              properties: {}
            }
          ]
        }
      });

      // Check release feature
      const releaseFeature = data.child_features.find((f) => f.type === 'release');
      expect(releaseFeature).to.exist;
      expect(releaseFeature?.properties).to.eql({
        description: 'Released after data collection',
        timestamp: '2023-07-11T16:30:00',
        geometry: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-126.789, 51.3456]
              },
              properties: {}
            }
          ]
        }
      });
    });
  });

  describe('With markings and measurements', () => {
    let data: PostSurveyAnimalToBiohubObject;

    const obj: ICritterDetailed = {
      critter_id: 'animal-uuid-markings',
      wlh_id: 'WLH-MARK-001',
      animal_id: 'DEER-001',
      sex: { qualitative_option_id: 'uuid-male', label: 'Male' },
      itis_tsn: 180693,
      itis_scientific_name: 'Cervidae',
      critter_comment: 'Male deer with ear tag and measurements',
      captures: [
        {
          capture_id: 'capture-uuid-with-markings',
          critter_id: 'animal-uuid-markings',
          capture_date: '2023-10-15',
          capture_time: '14:20:00',
          capture_comment: 'Capture with markings and measurements',
          markings: [
            {
              marking_id: 'marking-uuid-1',
              identifier: 'EAR-TAG-123',
              frequency: null,
              frequency_unit: null,
              comment: 'Blue ear tag on left ear',
              taxon_marking_body_location: 'Ear',
              marking_type: 'Ear Tag',
              primary_colour: 'Blue',
              secondary_colour: null
            } as any
          ],
          quantitative_measurements: [
            {
              measurement_quantitative_id: 'measurement-uuid-1',
              measurement_name: 'Weight',
              value: 85,
              comment: 'Measured in kilograms'
            } as any,
            {
              measurement_quantitative_id: 'measurement-uuid-2',
              measurement_name: 'Body Length',
              value: 180,
              comment: 'Measured in centimeters'
            } as any
          ],
          qualitative_measurements: [],
          capture_location: { latitude: 49.2827, longitude: -123.1207 },
          release_location: { latitude: 49.2827, longitude: -123.1207 }
        }
      ],
      mortality: null as any
    };

    before(() => {
      data = new PostSurveyAnimalToBiohubObject(obj);
    });

    it('includes capture with markings and measurements as child features', () => {
      expect(data.child_features).to.have.length(1);

      const captureFeature = data.child_features.find((f) => f.type === 'capture');
      expect(captureFeature).to.exist;
      expect(captureFeature?.child_features).to.have.length(3); // 1 marking + 2 measurements

      // Check marking child feature
      const markingFeature = captureFeature?.child_features.find((f) => f.type === 'marking');
      expect(markingFeature).to.exist;
      expect(markingFeature?.properties).to.eql({
        marking_type: 'Ear Tag',
        identifier: 'EAR-TAG-123',
        colour: 'Blue',
        body_position: 'Ear',
        description: 'Blue ear tag on left ear'
      });

      // Check measurement child features
      const measurementFeatures = captureFeature?.child_features.filter((f) => f.type === 'measurement') || [];
      expect(measurementFeatures).to.have.length(2);

      const weightMeasurement = measurementFeatures.find((f) => f.properties.measurement_type === 'Weight');
      expect(weightMeasurement?.properties).to.eql({
        measurement_type: 'Weight',
        measurement_value: '85',
        description: 'Measured in kilograms'
      });

      const lengthMeasurement = measurementFeatures.find((f) => f.properties.measurement_type === 'Body Length');
      expect(lengthMeasurement?.properties).to.eql({
        measurement_type: 'Body Length',
        measurement_value: '180',
        description: 'Measured in centimeters'
      });
    });
  });

  describe('With mortality', () => {
    let data: PostSurveyAnimalToBiohubObject;

    const obj: ICritterDetailed = {
      critter_id: 'animal-uuid-deceased',
      wlh_id: 'WLH-DEAD-001',
      animal_id: 'DEER-DECEASED-001',
      sex: { qualitative_option_id: 'uuid-female', label: 'Female' },
      itis_tsn: 180693,
      itis_scientific_name: 'Cervidae',
      critter_comment: 'Female deer found deceased',
      captures: [],
      mortality: [
        {
          mortality_id: 'mortality-uuid-1',
          mortality_timestamp: '2025-10-21T16:09:09.000Z',
          mortality_comment: 'Found deceased due to vehicle collision',
          location: {
            latitude: 50.959724,
            longitude: -120.673828
          },
          proximate_cause_of_death: {
            cod_category: 'Collision',
            cod_reason: 'Motor vehicle'
          }
        }
      ] as any
    };

    before(() => {
      data = new PostSurveyAnimalToBiohubObject(obj);
    });

    it('includes mortality as child feature', () => {
      expect(data.child_features).to.have.length(1);

      const mortalityFeature = data.child_features.find((f) => f.type === 'mortality');
      expect(mortalityFeature).to.exist;
      expect(mortalityFeature?.properties).to.eql({
        description: 'Found deceased due to vehicle collision',
        timestamp: '2025-10-21T16:09:09.000Z',
        geometry: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-120.673828, 50.959724]
              },
              properties: {}
            }
          ]
        },
        cause_of_death: 'Collision: Motor vehicle'
      });
    });
  });
});

describe('PostSurveyMortalityToBiohubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveyMortalityToBiohubObject;

    const mortalityObj = {
      mortality_id: 'mortality-test-1',
      mortality_timestamp: '2025-10-21T14:30:00.000Z',
      mortality_comment: 'Vehicle collision on highway',
      location: {
        latitude: 49.2827,
        longitude: -123.1207
      },
      proximate_cause_of_death: {
        cod_category: 'Collision',
        cod_reason: 'Motor vehicle'
      }
    };

    before(() => {
      data = new PostSurveyMortalityToBiohubObject(mortalityObj);
    });

    it('sets id', () => {
      expect(data.id).to.equal('mortality-test-1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('mortality');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        description: 'Vehicle collision on highway',
        timestamp: '2025-10-21T14:30:00.000Z',
        geometry: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-123.1207, 49.2827]
              },
              properties: {}
            }
          ]
        },
        cause_of_death: 'Collision: Motor vehicle'
      });
    });
  });

  describe('Null values provided', () => {
    let data: PostSurveyMortalityToBiohubObject;

    const mortalityObj = {
      mortality_id: 'mortality-test-2',
      mortality_timestamp: '2025-10-22T00:00:00.000Z',
      mortality_comment: null,
      location: null,
      proximate_cause_of_death: null
    };

    before(() => {
      data = new PostSurveyMortalityToBiohubObject(mortalityObj);
    });

    it('sets properties with null values', () => {
      expect(data.properties).to.eql({
        description: null,
        timestamp: '2025-10-22T00:00:00.000Z',
        geometry: {
          type: 'FeatureCollection',
          features: []
        },
        cause_of_death: null
      });
    });
  });

  describe('Minimal mortality data (like from critter endpoint)', () => {
    let data: PostSurveyMortalityToBiohubObject;

    const mortalityObj = {
      mortality_id: 'decbe72e-83b0-444a-8b5b-e745a63741dc',
      mortality_timestamp: '2025-10-21T09:09:09-07:00'
      // No mortality_comment, location, or proximate_cause_of_death
    };

    before(() => {
      data = new PostSurveyMortalityToBiohubObject(mortalityObj);
    });

    it('handles minimal data correctly', () => {
      expect(data.properties).to.eql({
        description: null,
        timestamp: '2025-10-21T09:09:09-07:00',
        geometry: {
          type: 'FeatureCollection',
          features: []
        },
        cause_of_death: null
      });
    });
  });
});

describe('PostSurveyMarkingToBiohubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveyMarkingToBiohubObject;

    const markingObj = {
      marking_id: 'marking-test-1',
      identifier: 'COLLAR-456',
      comment: 'GPS collar',
      taxon_marking_body_location: 'Neck',
      marking_type: 'Collar',
      primary_colour: 'Black',
      secondary_colour: 'White'
    };

    before(() => {
      data = new PostSurveyMarkingToBiohubObject(markingObj as any);
    });

    it('sets id', () => {
      expect(data.id).to.equal('marking-test-1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('marking');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        marking_type: 'Collar',
        identifier: 'COLLAR-456',
        colour: 'Black/White',
        body_position: 'Neck',
        description: 'GPS collar'
      });
    });
  });
});

describe('PostSurveyMeasurementToBiohubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveyMeasurementToBiohubObject;

    const measurementObj = {
      measurement_quantitative_id: 'measurement-test-1',
      measurement_name: 'Height',
      value: 120,
      comment: 'Height at shoulder'
    };

    before(() => {
      data = new PostSurveyMeasurementToBiohubObject(measurementObj);
    });

    it('sets id', () => {
      expect(data.id).to.equal('measurement-test-1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('measurement');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        measurement_type: 'Height',
        measurement_value: '120',
        description: 'Height at shoulder'
      });
    });
  });
});

describe('PostSurveyReleaseToBiohubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveyReleaseToBiohubObject;

    const captureObj = {
      capture_id: 'capture-uuid-3',
      critter_id: 'animal-uuid-123',
      capture_date: '2023-08-15',
      capture_time: '09:00:00',
      capture_comment: 'Research capture',
      release_date: '2023-08-16',
      release_time: '14:45:00',
      release_comment: 'Successful release after monitoring',
      markings: [],
      quantitative_measurements: [],
      qualitative_measurements: [],
      capture_location: { latitude: 52.1234, longitude: -127.5678 },
      release_location: { latitude: 52.2345, longitude: -127.6789 }
    };

    before(() => {
      data = new PostSurveyReleaseToBiohubObject(captureObj);
    });

    it('sets id', () => {
      expect(data.id).to.equal('capture-uuid-3-release');
    });

    it('sets type', () => {
      expect(data.type).to.equal('release');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        description: 'Successful release after monitoring',
        timestamp: '2023-08-16T14:45:00',
        geometry: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-127.6789, 52.2345]
              },
              properties: {}
            }
          ]
        }
      });
    });
  });

  describe('Null values provided', () => {
    let data: PostSurveyReleaseToBiohubObject;

    const captureObj = {
      capture_id: 'capture-uuid-4',
      critter_id: 'animal-uuid-456',
      capture_date: '2023-09-01',
      capture_time: null,
      capture_comment: null,
      release_date: '2023-09-02',
      release_time: null,
      release_comment: null,
      markings: [],
      quantitative_measurements: [],
      qualitative_measurements: [],
      capture_location: { latitude: 0, longitude: 0 },
      release_location: undefined
    } as any;

    before(() => {
      data = new PostSurveyReleaseToBiohubObject(captureObj);
    });

    it('sets properties with null values', () => {
      expect(data.properties).to.eql({
        description: null,
        timestamp: '2023-09-02',
        geometry: {
          type: 'FeatureCollection',
          features: []
        }
      });
    });
  });
});

describe('PostSurveyToBiohubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveyToBiohubObject;

    const observation_obj: SurveyObservationRecord = {
      survey_observation_id: 1,
      survey_id: 1,
      survey_sample_period_id: 1,
      latitude: 1,
      longitude: 1,
      count: 1,
      itis_tsn: 1,
      itis_scientific_name: 'itis_scientific_name',
      observation_time: 'observation_time',
      observation_date: 'observation_date',
      observation_sign_id: 1
    };

    const survey_obj: GetSurveyData = {
      id: 1,
      uuid: '1',
      project_id: 1,
      survey_name: 'survey_name',
      progress_id: 1,
      start_date: 'start_date',
      end_date: 'end_date',
      survey_types: [9],
      revision_count: 1,
      create_date: 'create_date',
      create_user: 1,
      update_date: 'update_date',
      update_user: 1,
      geometry: []
    } as GetSurveyData;

    before(() => {
      data = new PostSurveyToBiohubObject(
        survey_obj,
        [observation_obj],
        { type: 'FeatureCollection', features: [] },
        [],
        [],
        []
      );
    });

    it('sets id', () => {
      expect(data.id).to.equal('1');
    });

    it('sets type', () => {
      expect(data.type).to.equal('dataset');
    });

    it('sets properties', () => {
      expect(data.properties).to.eql({
        survey_id: 1,
        project_id: 1,
        name: 'survey_name',
        guid: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        start_date: 'start_date',
        end_date: 'end_date',
        survey_types: [9],
        revision_count: 1,
        geometry: { type: 'FeatureCollection', features: [] }
      });
    });

    it('sets features', () => {
      expect(data.child_features).to.eql([new PostSurveyObservationToBiohubObject(observation_obj)]);
    });
  });

  describe('With animals provided', () => {
    let data: PostSurveyToBiohubObject;

    const observation_obj: SurveyObservationRecord = {
      survey_observation_id: 1,
      survey_id: 1,
      survey_sample_period_id: 1,
      latitude: 1,
      longitude: 1,
      count: 1,
      itis_tsn: 1,
      itis_scientific_name: 'itis_scientific_name',
      observation_time: 'observation_time',
      observation_date: 'observation_date',
      observation_sign_id: 1
    };

    const survey_obj: GetSurveyData = {
      id: 1,
      uuid: '1',
      project_id: 1,
      survey_name: 'survey_name',
      progress_id: 1,
      start_date: 'start_date',
      end_date: 'end_date',
      survey_types: [9],
      revision_count: 1,
      create_date: 'create_date',
      create_user: 1,
      update_date: 'update_date',
      update_user: 1,
      geometry: []
    } as GetSurveyData;

    const animal_obj: ICritterDetailed = {
      critter_id: 'animal-uuid-123',
      wlh_id: 'WLH-123',
      animal_id: 'ANIMAL-456',
      sex: { qualitative_option_id: 'uuid-male', label: 'Male' },
      itis_tsn: 180543,
      itis_scientific_name: 'Ursus arctos',
      critter_comment: 'Large male bear',
      captures: [],
      mortality: null as any
    };

    before(() => {
      data = new PostSurveyToBiohubObject(
        survey_obj,
        [observation_obj],
        { type: 'FeatureCollection', features: [] },
        [],
        [],
        [animal_obj]
      );
    });

    it('includes animals in child_features', () => {
      expect(data.child_features).to.have.lengthOf(2);
      expect(data.child_features[0]).to.be.instanceOf(PostSurveyObservationToBiohubObject);
      expect(data.child_features[1]).to.be.instanceOf(PostSurveyAnimalToBiohubObject);
    });

    it('animal feature has correct properties', () => {
      const animalFeature = data.child_features.find(
        (feature) => feature.type === 'animal'
      ) as PostSurveyAnimalToBiohubObject;

      expect(animalFeature).to.not.be.undefined;
      expect(animalFeature.id).to.equal('animal-uuid-123');
      expect(animalFeature.properties).to.eql({
        taxon_id: 180543,
        animal_identifier: 'ANIMAL-456',
        description: 'Large male bear',
        sex: 'Male'
      });
    });
  });
});

describe('PostSurveySubmissionToBioHubObject', () => {
  describe('All values provided', () => {
    let data: PostSurveySubmissionToBioHubObject;

    const observation_obj: SurveyObservationRecord[] = [
      {
        survey_observation_id: 1,
        survey_id: 1,
        survey_sample_period_id: 1,
        latitude: 1,
        longitude: 1,
        count: 1,
        itis_tsn: 2,
        itis_scientific_name: 'itis_scientific_name',
        observation_time: 'observation_time',
        observation_date: 'observation_date',
        observation_sign_id: 1
      }
    ];

    const survey_obj: GetSurveyData = {
      id: 1,
      uuid: '1',
      project_id: 1,
      survey_name: 'survey_name',
      progress_id: 1,
      start_date: 'start_date',
      end_date: 'end_date',
      survey_types: [9],
      revision_count: 1
    };

    const purpose_and_methodology: GetSurveyPurposeAndMethodologyData = {
      intended_outcome_ids: [],
      additional_details: 'A description of the purpose',
      revision_count: 0
    };

    const survey_geometry: FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    const submissionComment = 'A comment about the submission';

    before(() => {
      data = new PostSurveySubmissionToBioHubObject(
        survey_obj,
        purpose_and_methodology,
        observation_obj,
        survey_geometry,
        [],
        [],
        submissionComment,
        []
      );
    });

    it('sets id', () => {
      expect(data.id).to.equal('1');
    });

    it('sets name', () => {
      expect(data.name).to.equal('survey_name');
    });

    it('sets description', () => {
      expect(data.description).to.equal('A description of the purpose');
    });

    it('sets comment', () => {
      expect(data.comment).to.equal('A comment about the submission');
    });

    it('sets content', () => {
      expect(data.content).to.eql(
        new PostSurveyToBiohubObject(survey_obj, observation_obj, survey_geometry, [], [], [])
      );
    });
  });
});
