import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CSVRowState } from '../csv-config-validation.interface';
import { getCritterCaptureRowValidator } from './critter-capture-row-validator';

chai.use(sinonChai);

describe('getCritterCaptureRowValidator', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return an error if the critter alias is not found in the survey alias map', () => {
    const getCellValueStub = sinon.stub();
    const getWorksheetHeaderStub = sinon.stub().returns('HEADER');

    const utils = {
      getCellValue: getCellValueStub,
      getWorksheetHeader: getWorksheetHeaderStub
    };

    getCellValueStub.onCall(0).returns('BAD_ALIAS');

    const surveyAliasMap = new Map<string, any>();

    const rowValidator = getCritterCaptureRowValidator(surveyAliasMap, utils as any);

    const errors = rowValidator({ row: {} } as any);

    expect(errors).to.have.lengthOf(1);
    expect(errors[0].error).to.contain('matching survey animal');
    expect(errors[0].cell).to.equal('BAD_ALIAS');
    expect(errors[0].header).to.be.equal('HEADER');
  });

  it('should return an error if the critter has no captures', () => {
    const getCellValueStub = sinon.stub();
    const getWorksheetHeaderStub = sinon.stub().returns('HEADER');

    const utils = {
      getCellValue: getCellValueStub,
      getWorksheetHeader: getWorksheetHeaderStub
    };

    getCellValueStub.onCall(0).returns('critter');

    const surveyAliasMap = new Map<string, any>([['critter', { captures: [] }]]);

    const rowValidator = getCritterCaptureRowValidator(surveyAliasMap, utils as any);

    const errors = rowValidator({ row: {} } as any);

    expect(errors).to.have.lengthOf(1);
    expect(errors[0].error).to.contain('no captures');
    expect(errors[0].cell).to.equal('critter');
    expect(errors[0].header).to.be.equal('HEADER');
  });

  it('should return an error if the capture date is not found in the critter captures', () => {
    const getCellValueStub = sinon.stub();
    const getWorksheetHeaderStub = sinon.stub().returns('HEADER');

    const utils = {
      getCellValue: getCellValueStub,
      getWorksheetHeader: getWorksheetHeaderStub
    };

    getCellValueStub.onCall(0).returns('critter');
    getCellValueStub.onCall(1).returns('2024-01-01');
    getCellValueStub.onCall(2).returns('10:10:00');

    const surveyAliasMap = new Map<string, any>([['critter', { captures: [{ capture_date: '2025-01-01' }] }]]);
    const rowValidator = getCritterCaptureRowValidator(surveyAliasMap, utils as any);

    const errors = rowValidator({ row: {} } as any);

    expect(errors).to.have.lengthOf(2);
    expect(errors[0].error).to.contain('Capture not found');
    expect(errors[0].cell).to.equal('2024-01-01');
    expect(errors[0].header).to.be.equal('HEADER');
    expect(errors[1].error).to.contain('Capture not found');
    expect(errors[1].cell).to.equal('10:10:00');
    expect(errors[1].header).to.be.equal('HEADER');
  });

  it('should return an error if multiple captures are found for the critter', () => {
    const getCellValueStub = sinon.stub();
    const getWorksheetHeaderStub = sinon.stub().returns('HEADER');

    const utils = {
      getCellValue: getCellValueStub,
      getWorksheetHeader: getWorksheetHeaderStub
    };

    getCellValueStub.onCall(0).returns('critter');
    getCellValueStub.onCall(1).returns('2024-01-01');
    getCellValueStub.onCall(2).returns('10:10:00');

    const surveyAliasMap = new Map<string, any>([
      [
        'critter',
        {
          captures: [
            {
              capture_date: '2024-01-01',
              capture_time: '10:10:00'
            },
            {
              capture_date: '2024-01-01',
              capture_time: '10:10:00'
            }
          ]
        }
      ]
    ]);
    const rowValidator = getCritterCaptureRowValidator(surveyAliasMap, utils as any);

    const errors = rowValidator({ row: {} } as any);

    expect(errors).to.have.lengthOf(1);
    expect(errors[0].error).to.contain('Multiple captures found');
    expect(errors[0].cell).to.equal('2024-01-01');
    expect(errors[0].header).to.be.equal('HEADER');
  });

  it('should return an empty array if the critter capture is valid', () => {
    const getCellValueStub = sinon.stub();
    const getWorksheetHeaderStub = sinon.stub().returns('HEADER');

    const utils = {
      getCellValue: getCellValueStub,
      getWorksheetHeader: getWorksheetHeaderStub
    };

    getCellValueStub.onCall(0).returns('critter');
    getCellValueStub.onCall(1).returns('2024-01-01');
    getCellValueStub.onCall(2).returns('10:10:00');

    const surveyAliasMap = new Map<string, any>([
      [
        'critter',
        {
          captures: [
            {
              capture_date: '2024-01-01',
              capture_time: '10:10:00'
            }
          ]
        }
      ]
    ]);
    const rowValidator = getCritterCaptureRowValidator(surveyAliasMap, utils as any);

    const errors = rowValidator({ row: {} } as any);

    expect(errors).to.have.lengthOf(0);
  });

  it('should update the row state with the critter_id and capture_id', () => {
    const getCellValueStub = sinon.stub();
    const getWorksheetHeaderStub = sinon.stub().returns('HEADER');

    const utils = {
      getCellValue: getCellValueStub,
      getWorksheetHeader: getWorksheetHeaderStub
    };

    getCellValueStub.onCall(0).returns('critter');
    getCellValueStub.onCall(1).returns('2024-01-01');
    getCellValueStub.onCall(2).returns('10:10:00');

    const surveyAliasMap = new Map<string, any>([
      [
        'critter',
        {
          critter_id: 'critter_id',
          captures: [
            {
              capture_id: 'capture_id',
              capture_date: '2024-01-01',
              capture_time: '10:10:00'
            }
          ]
        }
      ]
    ]);
    const rowValidator = getCritterCaptureRowValidator(surveyAliasMap, utils as any);

    const row = {};

    rowValidator({ row } as any);

    expect(row[CSVRowState].critter_id).to.equal('critter_id');
    expect(row[CSVRowState].capture_id).to.equal('capture_id');
  });
});
