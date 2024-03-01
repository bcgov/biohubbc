import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import {
  IAnimal,
  IAnimalCapture,
  IAnimalCollectionUnit,
  IAnimalMarking,
  IAnimalMeasurement,
  IAnimalMortality,
  IAnimalRelationship
} from './animal';
import { arrDiff, createCritterUpdatePayload, transformCritterbaseAPIResponseToForm } from './animal-form-helpers';

describe('animal form helpers', () => {
  describe('transformCritterbaseAPIResponseToForm', () => {
    it('should return an object matching the IAnimal interface', () => {
      const detailedResponse: IDetailedCritterWithInternalId = {
        survey_critter_id: 1,
        critter_id: 'c8601a4a-3946-4d1a-8c3f-a07088112284',
        itis_tsn: '93ced109-d806-4851-90d7-064951cfc4f5',
        wlh_id: 'abc',
        animal_id: 'def',
        sex: 'Male',
        responsible_region_nr_id: '4a08bf72-86e3-435e-9423-1ade03fa1316',
        create_user: '4e038522-53ca-43a4-af57-07af0218693c',
        update_user: '4e038522-53ca-43a4-af57-07af0218693c',
        create_timestamp: '2022-02-02',
        update_timestamp: '2022-02-02',
        critter_comment: '',
        itis_scientific_name: 'Caribou',
        responsible_region: 'Montana',
        mortality_timestamp: null,
        collection_units: [
          {
            critter_collection_unit_id: 'e1300b5e-6ea7-4537-a834-46be1b1fa573',
            category_name: 'Population Unit',
            unit_name: 'Itcha-Ilgachuz',
            collection_unit_id: '0284c4ca-a279-4135-b6ef-d8f4f8c3d1e6',
            collection_category_id: '9dcf05a8-9bfe-421b-b487-ce65299441ca'
          }
        ],
        mortality: [
          {
            mortality_id: 'b93f66b4-8dfe-4810-9620-d3727989408d',
            location_id: 'e51b93fb-a5fd-4816-aa16-bf14b21e27f9',
            mortality_timestamp: '2020-10-10T07:00:00.000Z',
            proximate_cause_of_death_id: '8d530b47-d4d3-4c6d-a87c-b440449d2781',
            proximate_cause_of_death_confidence: '',
            proximate_predated_by_taxon_id: '',
            ultimate_cause_of_death_id: null,
            ultimate_cause_of_death_confidence: '',
            ultimate_predated_by_taxon_id: null,
            mortality_comment: 'Mortality email Nov 11, 2020 & Sept 29th and 30, 2020',
            location: {
              latitude: 52.676422548679,
              longitude: -124.9568080904715,
              coordinate_uncertainty: null,
              temperature: null,
              location_comment: null,
              region_env_id: 'b0f36d59-5cb5-423c-99e6-691215e964e9',
              region_nr_id: '724f03c1-bed3-43bf-8a8b-67733dc0721e',
              wmu_id: 'c9dbf5de-607b-466a-9804-fadc020295fc',
              region_env_name: 'Cariboo',
              region_nr_name: 'Cariboo Natural Resource Region',
              wmu_name: '5-12'
            }
          }
        ],
        capture: [
          {
            capture_id: 'd9ae9a17-4889-4628-bf32-3eb126bfb924',
            capture_location_id: '7f46207c-98db-43ab-9705-31fdd8fd9692',
            release_location_id: '7f46207c-98db-43ab-9705-31fdd8fd9692',
            capture_timestamp: '2019-02-05T08:00:00.000Z',
            release_timestamp: null,
            capture_comment: null,
            release_comment: null,
            capture_location: {
              latitude: 52.29500572856892,
              longitude: -124.550861955899,
              coordinate_uncertainty: null,
              temperature: null,
              location_comment: null,
              region_env_id: 'b0f36d59-5cb5-423c-99e6-691215e964e9',
              region_nr_id: '724f03c1-bed3-43bf-8a8b-67733dc0721e',
              wmu_id: 'c9dbf5de-607b-466a-9804-fadc020295fc',
              region_env_name: 'Cariboo',
              region_nr_name: 'Cariboo Natural Resource Region',
              wmu_name: '5-12'
            },
            release_location: {
              latitude: 52.29500572856892,
              longitude: -124.550861955899,
              coordinate_uncertainty: null,
              temperature: null,
              location_comment: null,
              region_env_id: 'b0f36d59-5cb5-423c-99e6-691215e964e9',
              region_nr_id: '724f03c1-bed3-43bf-8a8b-67733dc0721e',
              wmu_id: 'c9dbf5de-607b-466a-9804-fadc020295fc',
              region_env_name: 'Cariboo',
              region_nr_name: 'Cariboo Natural Resource Region',
              wmu_name: '5-12'
            }
          }
        ],
        marking: [
          {
            marking_id: '0e3afd57-a0bb-4704-a417-f4005f26e86b',
            capture_id: 'd9ae9a17-4889-4628-bf32-3eb126bfb924',
            mortality_id: null,
            taxon_marking_body_location_id: '372020d9-b9ee-4eb3-abdd-b476711bd1aa',
            marking_type_id: '274fe690-e253-4987-b11a-5b762d38adf3',
            marking_material_id: '76ae6a61-c789-4b19-806d-5f38f300c14f',
            primary_colour_id: '4aa3cce7-94d0-42d0-a183-078db5fbdd34',
            secondary_colour_id: null,
            identifier: '',
            frequency: null,
            frequency_unit: null,
            order: null,
            comment: 'Ported from BCTW, original data: < YELLOW >',
            attached_timestamp: '2019-02-05T08:00:00.000Z',
            removed_timestamp: null,
            body_location: 'Left Ear',
            marking_type: 'Ear Tag',
            marking_material: 'Plastic',
            primary_colour: 'Yellow',
            secondary_colour: null,
            text_colour: null
          }
        ],
        measurement: {
          qualitative: [
            {
              measurement_qualitative_id: 'd1ad55b2-c060-4ca0-863a-cd33e1da53c2',
              taxon_measurement_id: '9a0a5ac1-f813-40b6-bb5e-58f70e87615d',
              capture_id: 'd9ae9a17-4889-4628-bf32-3eb126bfb924',
              mortality_id: null,
              qualitative_option_id: 'c8691135-2ef3-44c5-81cb-eaabf3462664',
              measurement_comment: 'Ported from BCTW, original data: < No >',
              measured_timestamp: null,
              measurement_name: 'Juvenile at heel indicator',
              option_label: 'False',
              option_value: 0
            }
          ],
          quantitative: [
            {
              measurement_quantitative_id: 'efc1021d-9527-4ceb-8393-33fb2868ec25',
              taxon_measurement_id: '398a4636-5a24-418d-ba48-4aaefcca7816',
              capture_id: 'd9ae9a17-4889-4628-bf32-3eb126bfb924',
              mortality_id: null,
              value: 0,
              measurement_comment: 'Ported from BCTW, original data: < No >',
              measured_timestamp: null,
              measurement_name: 'Juvenile count'
            }
          ]
        },
        family_parent: [
          {
            family_id: 'd9ae9a17-4889-4628-bf32-3eb126bfb924',
            parent_critter_id: 'c8601a4a-3946-4d1a-8c3f-a07088112284'
          }
        ],
        family_child: [
          {
            family_id: 'efc1021d-9527-4ceb-8393-33fb2868ec25',
            child_critter_id: 'c8601a4a-3946-4d1a-8c3f-a07088112284'
          }
        ]
      };

      const result = transformCritterbaseAPIResponseToForm(detailedResponse);

      expect(result.general.wlh_id).toBe('abc');
      expect(result.general.critter_id).toBe('c8601a4a-3946-4d1a-8c3f-a07088112284');
      expect(result.general.sex).toBe('Male');
      expect(result.general.animal_id).toBe('def');
      expect(result.general.itis_tsn).toBe('93ced109-d806-4851-90d7-064951cfc4f5');
      expect(result.captures.length).toBe(1);
      expect(result.markings.length).toBe(1);
      expect(result.mortality.length).toBe(1);
      expect(result.measurements.length).toBe(2);
      expect(result.family.length).toBe(2);
    });
  });

  describe('createCritterUpdatePayload', () => {
    it('should return an object containing two instances of Critter', () => {
      const capture: IAnimalCapture = {
        capture_id: '8b9281ea-fbe8-411c-9b50-70ffd08737cb',
        capture_location_id: undefined,
        release_location_id: undefined,
        capture_longitude: 0,
        capture_latitude: 0,
        capture_utm_northing: 0,
        capture_utm_easting: 0,
        capture_timestamp: new Date(),
        capture_coordinate_uncertainty: 0,
        capture_comment: 'before',
        projection_mode: undefined,
        show_release: false,
        release_longitude: 0,
        release_latitude: 0,
        release_utm_northing: 0,
        release_utm_easting: 0,
        release_coordinate_uncertainty: 0,
        release_timestamp: new Date(),
        release_comment: 'undefined'
      };

      const marking: IAnimalMarking = {
        marking_id: undefined,
        marking_type_id: '845f27ac-f0b2-4128-9615-18980e5c8caa',
        taxon_marking_body_location_id: '46e6b939-3485-4c45-9f26-607489e50def',
        primary_colour_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        secondary_colour_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        primary_colour: 'red',
        body_location: 'Rear Leg',
        marking_type: 'tag',
        marking_comment: ''
      };

      const measure: IAnimalMeasurement = {
        measurement_qualitative_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        measurement_quantitative_id: undefined,
        taxon_measurement_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        qualitative_option_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        value: undefined,
        measured_timestamp: new Date(),
        measurement_comment: 'a',
        measurement_name: 'weight',
        option_label: 'test'
      };

      const mortality: IAnimalMortality = {
        mortality_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        location_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        mortality_longitude: 0,
        mortality_latitude: 0,
        mortality_utm_northing: 0,
        mortality_utm_easting: 0,
        mortality_timestamp: new Date(),
        mortality_coordinate_uncertainty: 0,
        mortality_comment: 'tttt',
        proximate_cause_of_death_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        proximate_cause_of_death_confidence: undefined,
        proximate_predated_by_taxon_id: undefined,
        ultimate_cause_of_death_id: undefined,
        ultimate_cause_of_death_confidence: undefined,
        ultimate_predated_by_taxon_id: undefined,
        projection_mode: 'wgs'
      };

      const collectionUnits: IAnimalCollectionUnit = {
        collection_unit_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        unit_name: 'Pop',
        category_name: 'Population Unit',
        collection_category_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        critter_collection_unit_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097'
      };

      const family: IAnimalRelationship = {
        family_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        relationship: 'child'
      };

      const initialFormValues: IAnimal = {
        general: {
          wlh_id: 'wlh-a',
          itis_tsn: '',
          animal_id: '',
          itis_scientific_name: undefined,
          sex: undefined,
          critter_id: undefined
        },
        captures: [capture, { ...capture, capture_id: '0ec88875-0219-4635-b7cf-8da8ba732fc1' }],
        markings: [marking, { ...marking, marking_id: '0ec88875-0219-4635-b7cf-8da8ba732fc1' }],
        measurements: [measure, { ...measure, measurement_qualitative_id: '0ec88875-0219-4635-b7cf-8da8ba732fc1' }],
        mortality: [mortality, { ...mortality, mortality_id: '0ec88875-0219-4635-b7cf-8da8ba732fc1' }],
        family: [family, { ...family, relationship: 'parent' }],
        images: [],
        collectionUnits: [
          collectionUnits,
          { ...collectionUnits, critter_collection_unit_id: '0ec88875-0219-4635-b7cf-8da8ba732fc1' }
        ],
        device: []
      };

      const currentFormValues: IAnimal = {
        general: {
          itis_tsn: '',
          animal_id: '',
          itis_scientific_name: undefined,
          wlh_id: 'wlh-b',
          sex: undefined,
          critter_id: undefined
        },
        captures: [{ ...capture, capture_comment: 'after' }],
        markings: [marking],
        measurements: [measure],
        mortality: [mortality],
        family: [],
        images: [],
        collectionUnits: [],
        device: []
      };

      const { create, update } = createCritterUpdatePayload(initialFormValues, currentFormValues);

      expect(create.markings.length).toBe(1);
      expect(update.wlh_id).toBe('wlh-b');
      expect(update.captures.length).toBe(2);
      expect(update.mortalities.length).toBe(2);
      expect(update.collections.length).toBe(2);
      expect(update.markings.length).toBe(2);
      expect(update.measurements.qualitative.length).toBe(2);
      expect(update.families.parents.length).toBe(1);
      expect(update.families.children.length).toBe(1);
    });
  });

  describe('arrDiff', () => {
    it('should yield only elements from arr1 not present in arr2', () => {
      const arr1 = [{ pk: 'a' }, { pk: 'b' }];
      const arr2 = [{ pk: 'a' }, { pk: 'c' }];

      const result = arrDiff(arr1, arr2, 'pk');

      expect(result.length).toBe(1);
      expect(result.find((a) => a.pk === 'b')).toBeDefined();
    });
  });
});
