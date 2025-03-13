import { expect } from 'chai';
import { z } from 'zod';
import { CSVRow, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { createRowStateGetter, updateCSVRowState } from './row-state';

describe('row-state', () => {
  describe('updateCSVRowState', () => {
    it('should create the state in the row and add the new value', () => {
      const row = { TEST: 'cellValue' };

      updateCSVRowState(row, { stateValue: 'value' });

      expect(row[CSVRowState]?.stateValue).to.equal('value');
    });

    it('should update the state in the row and add the new value', () => {
      const row = { TEST: 'cellValue', [CSVRowState]: { stateValue: 'oldValue' } };

      updateCSVRowState(row, { stateValue: 'newValue' });

      expect(row[CSVRowState]?.stateValue).to.equal('newValue');
    });

    it('should remove the state in the row', () => {
      const row = { TEST: 'cellValue', [CSVRowState]: { stateValue: 'oldValue' } };

      updateCSVRowState(row, { stateValue: undefined });

      expect(row[CSVRowState]?.stateValue).to.be.undefined;
    });

    it('should add additional state values', () => {
      const row: CSVRow = { TEST: 'cellValue', [CSVRowState]: { stateValue: 'oldValue' } };

      updateCSVRowState(row, { stateValue: 'newValue', additionalValue: 'value' });

      expect(row[CSVRowState]?.stateValue).to.equal('newValue');
      expect(row[CSVRowState]?.additionalValue).to.equal('value');
    });

    it('should set nested state values', () => {
      const row: CSVRow = { TEST: 'cellValue' };

      updateCSVRowState(row, { state: { value: 'newValue' } });

      expect(row[CSVRowState]?.state?.value).to.equal('newValue');
    });

    it('should update nested state values', () => {
      const row: CSVRow = { TEST: 'cellValue', [CSVRowState]: { state: { value: 'oldValue' } } };

      updateCSVRowState(row, { state: { value: 'newValue' } });

      expect(row[CSVRowState]?.state?.value).to.equal('newValue');
    });

    it('should append matching state values', () => {
      const row: CSVRow = { TEST: 'cellValue', [CSVRowState]: { state: { value: 'oldValue' } } };

      updateCSVRowState(row, { state: { value: 'newValue' } }, { append: true });

      expect(row[CSVRowState]?.state).to.eql([{ value: 'oldValue' }, { value: 'newValue' }]);
    });
  });

  describe('createRowStateGetter', () => {
    it('should not throw an error when the row state is valid', () => {
      const row = {
        [CSVRowState]: {
          id: '123'
        }
      };

      const getRowState = createRowStateGetter(z.object({ id: z.string() }));

      expect(getRowState(row)).to.deep.equal({ id: '123' });
    });

    it('should allow for the row state to be passed directly', () => {
      const state = {
        id: '123'
      };

      const getRowState = createRowStateGetter(z.object({ id: z.string() }));

      expect(getRowState(state)).to.deep.equal({ id: '123' });
    });

    it('should throw an error when the row state is invalid', () => {
      const row = {
        [CSVRowState]: {
          id: 123
        }
      };

      const getRowState = createRowStateGetter(z.object({ id: z.string() }));

      try {
        getRowState(row);
        expect.fail('Should have thrown an error');
      } catch (err: any) {
        expect(err.message).to.equal('Invalid CSV row state');
        expect(err.errors[0].state).to.deep.equal({ id: 123 });
      }
    });
  });
});
