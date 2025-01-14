import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { ICritterDetailed } from '../../critterbase-service';
import { getCaptureDateCellValidator } from './capture-header-configs';

chai.use(sinonChai);

describe('import-captures-service', () => {
  describe('getCaptureDateCellValidator', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should return an error if the string is not a date', () => {
      const validator = getCaptureDateCellValidator(new Map(), new CSVConfigUtils({}, {} as any));

      const errors = validator({ cell: 'not-a-date' } as any);

      expect(errors[0].error).to.be.equal('Invalid date');
    });

    it('should return an error if the capture already exists in the map', () => {
      const utils = new CSVConfigUtils({}, {} as any);

      const getCellValueStub = sinon.stub(utils, 'getCellValue');

      getCellValueStub.onFirstCall().returns('12:00:00');
      getCellValueStub.onSecondCall().returns('alias');

      const validator = getCaptureDateCellValidator(
        new Map([
          [
            'alias',
            {
              critter_id: 'uuid',
              captures: [{ capture_date: '2021-01-01', capture_time: '12:00' }]
            } as ICritterDetailed
          ]
        ]),
        new CSVConfigUtils({}, {} as any)
      );

      const errors = validator({
        cell: '2021-01-01',
        row: { ALIAS: 'alias', CAPTURE_DATE: '2021-01-01', CAPTURE_TIME: '12:00' }
      } as any);

      expect(errors[0].error).to.be.equal('Capture already exists for critter on this date and time');
    });
  });
});
