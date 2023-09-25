import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { v4 } from 'uuid';
import { IAnimal, IAnimalCapture, IAnimalMarking } from './animal';
import { arrDiff, createCritterUpdatePayload, transformCritterbaseAPIResponseToForm } from './animal-form-helpers';

describe('animal form helpers', () => {
  describe('transformCritterbaseAPIResponseToForm', () => {
    it('should return an object matching the IAnimal interface', () => {
      const detailedResponse: IDetailedCritterWithInternalId = {
        survey_critter_id: 1,
        critter_id: v4(),
        taxon_id: v4(),
        wlh_id: 'abc',
        animal_id: 'def',
        sex: 'Male',
        responsible_region_nr_id: v4(),
        create_user: v4(),
        update_user: v4(),
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

      expect(result.general.wlh_id).toBe(detailedResponse.wlh_id);
      expect(result.general.critter_id).toBe(detailedResponse.critter_id);
      expect(result.general.sex).toBe(detailedResponse.sex);
      expect(result.general.animal_id).toBe(detailedResponse.animal_id);
      expect(result.general.taxon_id).toBe(detailedResponse.taxon_id);
    });
  });

  describe('createCritterUpdatePayload', () => {
    it('should return an object containing two instances of Critter', () => {
      const capture: IAnimalCapture = {
        _id: '',
        capture_id: v4(),
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
        marking_type_id: v4(),
        taxon_marking_body_location_id: v4(),
        primary_colour_id: v4(),
        secondary_colour_id: v4(),
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
