import yup from 'utils/YupSchema';
import { getAnimalFieldName, glt, IAnimal, IAnimalMarking, isReq, lastAnimalValueValid } from './animal';

const animal: IAnimal = {
  general: { taxon_id: '', taxon_name: '', animal_id: '' },
  captures: [],
  markings: [],
  mortality: [],
  measurements: [],
  family: [],
  images: [],
  device: undefined
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
        expect(!valid);
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
        expect(!valid);
      });

      it('should return false when last value in section parses successfully with yup schema', () => {
        const valid = lastAnimalValueValid('markings', {
          ...animal,
          markings: [
            {
              marking_type_id: '',
              taxon_marking_body_location_id: 'b'
            } as IAnimalMarking
          ]
        });
        expect(valid);
      });
    });

    describe(isReq.name, () => {
      const schema = yup.object({
        prop: yup.string().required()
      });

      const schema2 = yup.object({
        prop: yup.string()
      });

      it('should return true when prop required in yup schema', () => {
        expect(isReq(schema, 'prop'));
      });

      it('should return false when prop not required in yup schema', () => {
        expect(isReq(schema2, 'prop'));
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
  describe('Critter Class', () => { });
});
