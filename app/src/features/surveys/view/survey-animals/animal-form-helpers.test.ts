import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { v4 } from 'uuid';
import { IAnimal, IAnimalCapture, IAnimalMarking } from './animal';
import { arrDiff, createCritterUpdatePayload, transformCritterbaseAPIResponseToForm } from './animal-form-helpers';

describe('animal form helpers', () => {
  describe('transformCritterbaseAPIResponseToForm', () => {
    it('should return an object matching the IAnimal interface', () => {
      const detailedResponse: IDetailedCritterWithInternalId = {
        survey_critter_id: 1,
        critter_id: 'c8601a4a-3946-4d1a-8c3f-a07088112284',
        taxon_id: '93ced109-d806-4851-90d7-064951cfc4f5',
        wlh_id: 'abc',
        animal_id: 'def',
        sex: 'Male',
        responsible_region_nr_id: '4a08bf72-86e3-435e-9423-1ade03fa1316',
        create_user: '4e038522-53ca-43a4-af57-07af0218693c',
        update_user: '4e038522-53ca-43a4-af57-07af0218693c',
        create_timestamp: '2022-02-02',
        update_timestamp: '2022-02-02',
        critter_comment: '',
        taxon: 'Caribou',
        responsible_region: 'Montana',
        mortality_timestamp: null,
        collection_units: [],
        mortality: [],
        capture: [],
        marking: [],
        measurement: {
          qualitative: [],
          quantitative: []
        },
        family_parent: [],
        family_child: []
      };

      const result = transformCritterbaseAPIResponseToForm(detailedResponse);

      expect(result.general.wlh_id).toBe('abc');
      expect(result.general.critter_id).toBe('c8601a4a-3946-4d1a-8c3f-a07088112284');
      expect(result.general.sex).toBe('Male');
      expect(result.general.animal_id).toBe('def');
      expect(result.general.taxon_id).toBe('93ced109-d806-4851-90d7-064951cfc4f5');
    });
  });

  describe('createCritterUpdatePayload', () => {
    it('should return an object containing two instances of Critter', () => {
      const capture: IAnimalCapture = {
        _id: '',
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
        _id: '',
        marking_id: undefined,
        marking_type_id: '845f27ac-f0b2-4128-9615-18980e5c8caa',
        taxon_marking_body_location_id: '46e6b939-3485-4c45-9f26-607489e50def',
        primary_colour_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        secondary_colour_id: 'eaf6b7a0-c47c-4dba-83b4-88e9331ee097',
        marking_comment: ''
      };

      const initialFormValues: IAnimal = {
        general: {
          wlh_id: 'wlh-a',
          taxon_id: '',
          animal_id: '',
          taxon_name: undefined,
          sex: undefined,
          critter_id: undefined
        },
        captures: [capture],
        markings: [],
        measurements: [],
        mortality: [],
        family: [],
        images: [],
        collectionUnits: [],
        device: undefined
      };

      const currentFormValues: IAnimal = {
        general: {
          taxon_id: '',
          animal_id: '',
          taxon_name: undefined,
          wlh_id: 'wlh-b',
          sex: undefined,
          critter_id: undefined
        },
        captures: [{ ...capture, capture_comment: 'after' }],
        markings: [marking],
        measurements: [],
        mortality: [],
        family: [],
        images: [],
        collectionUnits: [],
        device: undefined
      };

      const { create, update } = createCritterUpdatePayload(initialFormValues, currentFormValues);

      expect(create.markings.length).toBe(1);
      expect(update.wlh_id).toBe('wlh-b');
      expect(update.captures.length).toBe(1);
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
