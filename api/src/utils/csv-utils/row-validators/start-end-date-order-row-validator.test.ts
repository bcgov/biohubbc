import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getStartDateIsBeforeEndDateRowValidator } from './start-end-date-order-row-validator';

chai.use(sinonChai);

describe.only('getStartDateIsBeforeEndDateRowValidator', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return no errors when start dates are before end dates (no time)', () => {
    const utils = {
      getCellValue: sinon.stub()
    } as any;

    utils.getCellValue.onCall(0).returns('2021-01-01');
    utils.getCellValue.onCall(1).returns('2021-01-02');

    const validator = getStartDateIsBeforeEndDateRowValidator(utils, {
      startDate: 'START_DATE',
      endDate: 'END_DATE'
    });

    const result = validator({ row: {} } as any);

    expect(result).to.be.an('array').that.is.empty;
  });

  it('should return no errors when start dates are before end dates (with time)', () => {
    const utils = {
      getCellValue: sinon.stub()
    } as any;

    utils.getCellValue.onCall(0).returns('2021-01-01');
    utils.getCellValue.onCall(1).returns('2021-01-02');
    utils.getCellValue.onCall(2).returns('11:00:00');
    utils.getCellValue.onCall(3).returns('12:00:00');

    const validator = getStartDateIsBeforeEndDateRowValidator(utils, {
      startDate: 'START_DATE',
      endDate: 'END_DATE',
      startTime: 'START_TIME',
      endTime: 'END_TIME'
    });

    const result = validator({ row: {} } as any);

    expect(result).to.be.an('array').that.is.empty;
  });

  it('should return an error when start dates are after end dates (no time)', () => {
    const utils = {
      getCellValue: sinon.stub()
    } as any;

    utils.getCellValue.onCall(0).returns('2021-01-02');
    utils.getCellValue.onCall(1).returns('2021-01-01');

    const validator = getStartDateIsBeforeEndDateRowValidator(utils, {
      startDate: 'START_DATE',
      endDate: 'END_DATE'
    });

    const result = validator({ row: {} } as any);

    expect(result).to.be.an('array').with.length(1);
    expect(result[0].error).to.contain('is after end date');
  });

  it('should return an error when start dates are after end dates (with time)', () => {
    const utils = {
      getCellValue: sinon.stub()
    } as any;

    utils.getCellValue.onCall(0).returns('2021-01-02');
    utils.getCellValue.onCall(1).returns('2021-01-01');
    utils.getCellValue.onCall(2).returns('12:00:00');
    utils.getCellValue.onCall(3).returns('11:00:00');

    const validator = getStartDateIsBeforeEndDateRowValidator(utils, {
      startDate: 'START_DATE',
      endDate: 'END_DATE',
      startTime: 'START_TIME',
      endTime: 'END_TIME'
    });

    const result = validator({ row: {} } as any);

    expect(result).to.be.an('array').with.length(1);
    expect(result[0].error).to.contain('is after end date');
  });

  it('should return an error when either date is invalid', () => {
    const utils = {
      getCellValue: sinon.stub()
    } as any;

    utils.getCellValue.onCall(0).returns('invalid');
    utils.getCellValue.onCall(1).returns('2021-01-01');

    const validator = getStartDateIsBeforeEndDateRowValidator(utils, {
      startDate: 'START_DATE',
      endDate: 'END_DATE'
    });

    const result = validator({ row: {} } as any);

    expect(result).to.be.an('array').with.length(1);
    expect(result[0].error).to.contain('Unable to parse date and time values');
  });
});
