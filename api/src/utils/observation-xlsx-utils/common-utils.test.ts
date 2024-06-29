import { expect } from 'chai';
import { describe } from 'mocha';
import { isQualitativeValueValid, isQuantitativeValueValid } from './common-utils';

describe('common-utils', () => {
  describe('isQualitativeValueValid', () => {
    it('qualitative value is valid', () => {
      const value = 'Hind Leg';
      const options = ['Hind Leg', 'Front Leg'];

      const results = isQualitativeValueValid(value, options);

      expect(results).to.be.true;
    });

    it('qualitative value is invalid', () => {
      const value = 'Hind Leg';
      const options = ['Back Leg', 'Front Leg'];

      const results = isQualitativeValueValid(value, options);

      expect(results).to.be.false;
    });
  });

  describe('isQuantitativeValueValid', () => {
    describe('both min and max set', () => {
      it('value is between the min and max', () => {
        const value = 2;
        const min = 1;
        const max = 4;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.true;
      });

      it('value is equal to the minimum', () => {
        const value = 1;
        const min = 1;
        const max = 4;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.true;
      });

      it('value is equal to the maximum', () => {
        const value = 4;
        const min = 1;
        const max = 4;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.true;
      });

      it('value is less than the minimum', () => {
        const value = 0;
        const min = 1;
        const max = 4;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.false;
      });

      it('value is greater than the maximum', () => {
        const value = 5;
        const min = 1;
        const max = 4;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.false;
      });
    });

    describe('only min set', () => {
      it('value is greater than the minimum', () => {
        const value = 5;
        const min = 1;
        const max = null;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.true;
      });

      it('value is equal to the minimum', () => {
        const value = 1;
        const min = 1;
        const max = null;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.true;
      });

      it('value is less than the minimum', () => {
        const value = -1;
        const min = 1;
        const max = null;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.false;
      });
    });

    describe('only max set', () => {
      it('value is less than the maximum', () => {
        const value = -1;
        const min = null;
        const max = 4;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.true;
      });

      it('value is equal to the maximum', () => {
        const value = 4;
        const min = null;
        const max = 4;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.true;
      });

      it('value is greater than the maximum', () => {
        const value = 5;
        const min = null;
        const max = 4;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.false;
      });
    });

    describe('neither min nor max set', () => {
      it('value is valid', () => {
        const value = 2;
        const min = null;
        const max = null;

        const results = isQuantitativeValueValid(value, min, max);

        expect(results).to.be.true;
      });
    });
  });
});
