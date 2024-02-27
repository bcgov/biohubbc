import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import {
  AnimalSex,
  Critter,
  getAnimalFieldName,
  glt,
  IAnimal,
  IAnimalMarking,
  isRequiredInSchema,
  lastAnimalValueValid
} from './animal';

const animal: IAnimal = {
  general: {
    itis_tsn: 'a',
    itis_scientific_name: 'taxon',
    animal_id: 'animal',
    wlh_id: 'a',
    sex: AnimalSex.MALE,
    critter_id: v4()
  },
  captures: [
    {
      capture_id: v4(),
      capture_location_id: undefined,
      release_location_id: undefined,
      capture_latitude: 3,
      capture_longitude: 3,
      capture_utm_northing: 19429156.095,
      capture_utm_easting: 7659804.274,
      capture_comment: 'comment',
      capture_coordinate_uncertainty: 10,
      capture_timestamp: new Date(),
      projection_mode: 'wgs',
      show_release: false,
      release_latitude: 3,
      release_longitude: 3,
      release_utm_northing: 19429156.095,
      release_utm_easting: 7659804.274,
      release_comment: 'comment',
      release_timestamp: new Date(),
      release_coordinate_uncertainty: 3
    }
  ],
  markings: [
    {
      marking_type_id: '274fe690-e253-4987-b11a-5b762d38adf3',
      taxon_marking_body_location_id: '372020d9-b9ee-4eb3-abdd-b476711bd1aa',
      primary_colour_id: '4aa3cce7-94d0-42d0-a183-078db5fbdd34',
      secondary_colour_id: '0b0dbfaa-fcc9-443f-8ac9-a22106663cba',
      marking_comment: 'asdf',
      marking_id: v4(),
      marking_type: 'tag',
      body_location: 'head',
      primary_colour: 'blue'
    }
  ],
  mortality: [],
  measurements: [],
  family: [],
  images: [],
  device: [],
  collectionUnits: [
    {
      collection_category_id: 'a',
      collection_unit_id: 'b',
      critter_collection_unit_id: v4(),
      category_name: 'Population Unit',
      unit_name: 'pop'
    }
  ]
};

describe('Animal', () => {
  describe('helper functions', () => {
    describe(getAnimalFieldName.name, () => {
      it('should format the name correctly when an index is provided', () => {
        const name = getAnimalFieldName<{ a: string }>('markings', 'a', 1);
        expect(name).toBe('markings.1.a');
      });

      it('should format the name correctly when no index provided', () => {
        const name = getAnimalFieldName<{ a: string }>('markings', 'a');
        expect(name).toBe('markings.a');
      });

      it('should format the name correctly when an index of 0 provided', () => {
        const name = getAnimalFieldName<{ a: string }>('markings', 'a', 0);
        expect(name).toBe('markings.0.a');
      });
    });

    describe(lastAnimalValueValid.name, () => {
      it('should return true when value empty array', () => {
        const valid = lastAnimalValueValid('captures', animal);
        expect(valid).toBe(true);
      });

      it('should return true when last value in section parses successfully with yup schema', () => {
        const valid = lastAnimalValueValid('markings', {
          ...animal,
          markings: [
            {
              marking_type_id: 'a',
              taxon_marking_body_location_id: 'b'
            } as IAnimalMarking
          ]
        });
        expect(valid).toBe(true);
      });

      it('should return false when last value in section parses unsuccessfully with yup schema', () => {
        const valid = lastAnimalValueValid('markings', {
          ...animal,
          markings: [
            {
              marking_type_id: '',
              taxon_marking_body_location_id: 'b'
            } as IAnimalMarking
          ]
        });
        expect(valid).toBe(false);
      });
    });

    describe(isRequiredInSchema.name, () => {
      const schema = yup.object({
        prop: yup.string().required()
      });

      const schema2 = yup.object({
        prop: yup.string()
      });

      it('should return true when prop required in yup schema', () => {
        expect(isRequiredInSchema(schema, 'prop')).toBe(true);
      });

      it('should return false when prop not required in yup schema', () => {
        expect(isRequiredInSchema(schema2, 'prop')).toBe(false);
      });
    });

    describe(glt.name, () => {
      it('should format the correct greater than msg', () => {
        expect(glt(1)).toBe('Must be greater than or equal to 1');
      });

      it('should format the correct less than msg', () => {
        expect(glt(1, false)).toBe('Must be less than or equal to 1');
      });
    });
  });
  describe('Critter Class', () => {
    const critter = new Critter(animal);
    it('should generate a critter name', () => {
      expect(critter.name).toBe('animal-taxon');
    });

    it('constructor should generate a critter uuid', () => {
      expect(critter.critter_id).toBeDefined();
    });

    it('constructor should create critter captures and locations', () => {
      const c_capture = critter.captures[0];
      const a_capture = animal.captures[0];

      const captureLocationID = c_capture.capture_location_id;
      const releaseLocationID = c_capture.release_location_id;

      expect(critter.captures).toBeDefined();
      expect(critter.captures.length).toBe(1);
      expect(c_capture.critter_id).toBe(critter.critter_id);
      expect(c_capture.release_comment).toBe(a_capture.release_comment);
      expect(c_capture.capture_comment).toBe(a_capture.capture_comment);
      expect(c_capture.capture_timestamp).toBe(a_capture.capture_timestamp);
      expect(c_capture.release_timestamp).toBe(a_capture.release_timestamp);
      expect(c_capture.capture_location_id).toBeDefined();
      expect(c_capture.release_location_id).toBeDefined();
      //one for capture one for release
      expect(critter.locations.length).toBe(2);
      critter.locations.forEach((l) => {
        const hasLocationID = [captureLocationID, releaseLocationID].includes(l.location_id);
        expect(hasLocationID).toBe(true);
      });
    });

    it('constructor should create critter markings', () => {
      const c_marking = critter.markings[0];
      const a_marking = animal.markings[0];
      expect(c_marking.critter_id).toBe(critter.critter_id);

      expect(c_marking.marking_type_id).toBe(a_marking.marking_type_id);
      expect(c_marking.taxon_marking_body_location_id).toBe(a_marking.taxon_marking_body_location_id);
      expect(c_marking.primary_colour_id).toBe(a_marking.primary_colour_id);
      expect(c_marking.secondary_colour_id).toBe(a_marking.secondary_colour_id);
      expect(c_marking.marking_comment).toBe(a_marking.marking_comment);
    });

    it('constructor should create collections and strip extra vals', () => {
      const c_collection = critter.collections[0];
      const a_collection = animal.collectionUnits[0];
      expect(c_collection.critter_id).toBe(critter.critter_id);
      expect((c_collection as any)['collection_category_id']).not.toBeDefined();
      expect(c_collection.collection_unit_id).toBe(a_collection.collection_unit_id);
    });
  });
});
