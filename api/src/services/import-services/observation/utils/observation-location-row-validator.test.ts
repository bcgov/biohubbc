import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CSVRowState } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { getObservationLocationRowValidator } from './observation-location-row-validator';

chai.use(sinonChai);

describe('getObservationLocationRowValidator', () => {
  beforeEach(() => {
    sinon.restore();
  });

  it('should return no errors when lat / long is defined', () => {
    const validator = getObservationLocationRowValidator({
      getCellValue: () => 'value',
      getWorksheetHeader: () => 'HEADER'
    } as any);

    expect(validator({ row: {} } as any)).to.be.an('array').that.is.empty;
  });

  it('should return no errors when sample period id is defined', () => {
    const validator = getObservationLocationRowValidator({
      getCellValue: () => undefined,
      getWorksheetHeader: () => 'HEADER'
    } as any);

    expect(validator({ row: { [CSVRowState]: { sample_period_id: 2 } } } as any)).to.be.an('array').that.is.empty;
  });

  it('should return errors when lat / long is not defined and sample period id is not defined', () => {
    const validator = getObservationLocationRowValidator({
      getCellValue: () => undefined,
      getWorksheetHeader: () => 'HEADER'
    } as any);

    const result = validator({ row: {} } as any);
    expect(result).to.be.an('array').with.lengthOf(2);

    expect(result[0].error).to.contain('Latitude is required when sampling');
  });
});
