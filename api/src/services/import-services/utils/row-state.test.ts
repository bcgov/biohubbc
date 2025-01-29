import { expect } from 'chai';
import { z } from 'zod';
import { CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { createRowStateGetter } from './row-state';

describe('row-state', () => {
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
