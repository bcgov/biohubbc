import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SurveySamplePeriodDetails } from '../../../../repositories/sample-period-repository';
import { getSamplePeriodIdFromRowState } from '../../utils/row-state';
import {
  findMatchingPeriodsWithObservationDateTime,
  findMatchingPeriodsWithSamplingInformation,
  findMatchingPeriodWithSamplePeriodId,
  getObservationSamplingInformationRowValidator,
  matchSamplePeriodDateToWorksheetPeriodDateTime,
  matchSamplePeriodTimeToWorksheetPeriodDateTime,
  matchSamplePeriodToWorksheetPeriod,
  validateSiteExistsInSurveySampleSiteMap,
  validateTechniqueExistsInSurveyTechniqueMap
} from './observation-sampling-row-validator';

chai.use(sinonChai);

describe('Worksheet sampling util functions', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('findMatchingPeriodsWithSamplingInformation', () => {
    it('should return the matching period when only site name provided', () => {
      const samplePeriods = [
        {
          survey_sample_site: {
            name: 'SampleSiteOne'
          }
        }
      ] as any[];

      const result = findMatchingPeriodsWithSamplingInformation(samplePeriods, {
        siteName: 'samplesiteone',
        techniqueName: null,
        period: null
      });

      expect(result.length).to.equal(1);
    });

    it('should return the matching period when only technique name provided', () => {
      const samplePeriods = [
        {
          method_technique: {
            name: 'MethodTechniqueOne'
          }
        }
      ] as any[];

      const result = findMatchingPeriodsWithSamplingInformation(samplePeriods, {
        siteName: null,
        techniqueName: 'methodtechniqueone',
        period: null
      });

      expect(result.length).to.equal(1);
    });

    it('should return the matching period when only period provided', () => {
      const samplePeriods = [
        {
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2021-01-02',
          end_time: '12:00:00'
        }
      ] as any[];

      const result = findMatchingPeriodsWithSamplingInformation(samplePeriods, {
        siteName: null,
        techniqueName: null,
        period: '2021-01-01 11:00:00 - 2021-01-02 12:00:00'
      });

      expect(result.length).to.equal(1);
    });

    it('should return the matching period when all information provided', () => {
      const samplePeriods = [
        {
          survey_sample_site: {
            name: 'SampleSiteOne'
          },
          method_technique: {
            name: 'MethodTechniqueOne'
          },
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2021-01-02',
          end_time: '12:00:00'
        }
      ] as any[];

      const result = findMatchingPeriodsWithSamplingInformation(samplePeriods, {
        siteName: 'samplesiteone',
        techniqueName: 'methodtechniqueone',
        period: '2021-01-01 11:00:00 - 2021-01-02 12:00:00'
      });

      expect(result.length).to.equal(1);
    });

    it('should return the matching period when all information provided and multiple periods', () => {
      const samplePeriods = [
        {
          survey_sample_site: {
            name: 'SampleSiteOne'
          },
          method_technique: {
            name: 'MethodTechniqueOne'
          },
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2021-01-02',
          end_time: '12:00:00'
        },
        {
          survey_sample_site: {
            name: 'SampleSiteTwo'
          },
          method_technique: {
            name: 'MethodTechniqueTwo'
          },
          start_date: '2021-01-02',
          start_time: '12:00:00',
          end_date: '2021-01-03',
          end_time: '13:00:00'
        }
      ] as any[];

      const result = findMatchingPeriodsWithSamplingInformation(samplePeriods, {
        siteName: 'samplesitetwo',
        techniqueName: 'methodtechniquetwo',
        period: '2021-01-02 12:00:00 - 2021-01-03 13:00:00'
      });

      expect(result.length).to.equal(1);
    });

    it('should return no matching periods when information incorrect', () => {
      const samplePeriods = [
        {
          survey_sample_site: {
            name: 'SampleSiteOne'
          },
          method_technique: {
            name: 'MethodTechniqueOne'
          },
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2021-01-02',
          end_time: '12:00:00'
        }
      ] as any[];

      const result = findMatchingPeriodsWithSamplingInformation(samplePeriods, {
        siteName: 'samplesiteone',
        techniqueName: 'methodtechniquetwo',
        period: '2021-01-02 12:00:00 - 2021-01-03 13:00:00'
      });

      expect(result.length).to.equal(0);
    });
  });

  describe('getObservationSamplingInformationRowValidator', () => {
    it('should throw an error when sample period id does not exist in the sample periods', () => {
      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(0).returns('SampleSiteOne');
      getCellValueStub.onCall(1).returns('MethodTechniqueOne');
      getCellValueStub.onCall(2).returns('2021-01-01 11:00:00 - 2021-01-02 12:00:00');

      const rowValidatorParams = {
        samplePeriods: [{ survey_sample_period_id: 1 }] as any[],
        sampleSites: [{ name: 'SampleSiteOne' }] as any[],
        methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
        utils: {
          getCellValue: getCellValueStub,
          getWorksheetHeader: () => 'HEADER'
        },
        samplePeriodId: 1
      } as any;

      const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

      try {
        validator({ row: {} } as any);
        expect.fail('should have thrown an error');
      } catch (err: any) {
        expect(err.message).to.exist;
      }
    });

    it('should update the row state with the sample period id when found', () => {
      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(0).returns('SampleSiteOne');
      getCellValueStub.onCall(1).returns('MethodTechniqueOne');
      getCellValueStub.onCall(2).returns('2021-01-01 11:00:00 - 2021-01-02 12:00:00');

      const rowValidatorParams = {
        samplePeriods: [{ survey_sample_period_id: 1 }] as any[],
        sampleSites: [{ name: 'SampleSiteOne' }] as any[],
        methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
        utils: {
          getCellValue: getCellValueStub,
          getWorksheetHeader: () => 'HEADER'
        },
        samplePeriodId: 1
      } as any;

      const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

      const params = { row: {} } as any;

      validator(params);

      expect(getSamplePeriodIdFromRowState(params.row).sample_period_id).to.equal(1);
      expect(getSamplePeriodIdFromRowState(params.row).sample_period_id).to.equal(1);
    });

    it('should return no errors when no sampling information and observation date provided with lat/lon', () => {
      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(3).returns('2021-01-01');
      getCellValueStub.onCall(4).returns('11:00:00');
      getCellValueStub.onCall(5).returns(1);
      getCellValueStub.onCall(6).returns(1);

      const rowValidatorParams = {
        samplePeriods: [{ survey_sample_period_id: 1 }] as any[],
        sampleSites: [{ name: 'SampleSiteOne' }] as any[],
        methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
        utils: {
          getCellValue: getCellValueStub,
          getWorksheetHeader: () => 'HEADER'
        },
        samplePeriodId: 1
      } as any;

      const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

      const result = validator({ row: {} } as any);

      expect(result.length).to.be.equal(0);
    });

    it('should return an error when no sampling information and no latitude but date provided', () => {
      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(3).returns('2021-01-01');
      getCellValueStub.onCall(4).returns('11:00:00');
      getCellValueStub.onCall(5).returns(null);
      getCellValueStub.onCall(6).returns(1);

      const rowValidatorParams = {
        samplePeriods: [{ survey_sample_period_id: 1 }] as any[],
        sampleSites: [{ name: 'SampleSiteOne' }] as any[],
        methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
        utils: {
          getCellValue: getCellValueStub,
          getWorksheetHeader: () => 'HEADER'
        },
        samplePeriodId: undefined
      } as any;

      const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

      const result = validator({ row: {} } as any);

      expect(result[0].error).to.contain('Latitude is required');
    });

    it('should return an error when no sampling information and no longitude but date provided', () => {
      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(3).returns('2021-01-01');
      getCellValueStub.onCall(4).returns('11:00:00');
      getCellValueStub.onCall(5).returns(1);
      getCellValueStub.onCall(6).returns(null);

      const rowValidatorParams = {
        samplePeriods: [{ survey_sample_period_id: 1 }] as any[],
        sampleSites: [{ name: 'SampleSiteOne' }] as any[],
        methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
        utils: {
          getCellValue: getCellValueStub,
          getWorksheetHeader: () => 'HEADER'
        },
        samplePeriodId: undefined
      } as any;

      const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

      const result = validator({ row: {} } as any);

      expect(result[0].error).to.contain('Longitude is required');
    });

    it('should return date, lat and lon errors when no sampling information and no latitude and longitude provided', () => {
      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(3).returns(null);
      getCellValueStub.onCall(4).returns('11:00:00');
      getCellValueStub.onCall(5).returns(null);
      getCellValueStub.onCall(6).returns(null);

      const rowValidatorParams = {
        samplePeriods: [{ survey_sample_period_id: 1 }] as any[],
        sampleSites: [{ name: 'SampleSiteOne' }] as any[],
        methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
        utils: {
          getCellValue: getCellValueStub,
          getWorksheetHeader: () => 'HEADER'
        },
        samplePeriodId: undefined
      } as any;

      const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

      const result = validator({ row: {} } as any);

      expect(result.length).to.equal(3);

      expect(result[0].error).to.contain('date is required');
      expect(result[1].error).to.contain('Latitude is required');
      expect(result[2].error).to.contain('Longitude is required');
    });

    it('should return an error when no sampling information and no observation date provided', () => {
      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(3).returns(null);
      getCellValueStub.onCall(4).returns(null);
      getCellValueStub.onCall(5).returns(1);
      getCellValueStub.onCall(6).returns(1);

      const rowValidatorParams = {
        samplePeriods: [{ survey_sample_period_id: 1 }] as any[],
        sampleSites: [{ name: 'SampleSiteOne' }] as any[],
        methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
        utils: {
          getCellValue: getCellValueStub,
          getWorksheetHeader: () => 'HEADER'
        },
        samplePeriodId: undefined
      } as any;

      const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

      const result = validator({ row: {} } as any);

      expect(result[0].error).to.contain('date is required');
    });

    it('should return an error when no matching period found', () => {
      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(0).returns('SampleSiteOne');
      getCellValueStub.onCall(1).returns('MethodTechniqueOne');
      getCellValueStub.onCall(2).returns('2021-01-01 - 2021-01-03');

      const samplePeriods = [
        {
          survey_sample_period_id: 1,
          survey_sample_site: {
            name: 'SampleSiteOne'
          },
          method_technique: {
            name: 'MethodTechniqueOne'
          },
          start_date: '2021-01-02',
          end_date: '2021-01-03'
        }
      ] as any[];

      const rowValidatorParams = {
        samplePeriods: samplePeriods,
        sampleSites: [{ name: 'SampleSiteOne', survey_sample_site_id: 2 }] as any[],
        methodTechniques: [{ name: 'MethodTechniqueOne', method_technique_id: 3 }] as any[],
        utils: {
          getCellValue: getCellValueStub,
          getWorksheetHeader: () => 'HEADER'
        },
        samplePeriodId: undefined
      } as any;

      const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

      const result = validator({ row: {} } as any);

      expect(result[0].error).to.contain('find matching sampling period');
    });

    it('should return no errors and update state when matching period found', () => {
      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(0).returns('SampleSiteOne');
      getCellValueStub.onCall(1).returns('MethodTechniqueOne');
      getCellValueStub.onCall(2).returns('2021-01-01 11:00:00 - 2021-01-02 12:00:00');

      const samplePeriods = [
        {
          survey_sample_period_id: 1,
          survey_sample_site: {
            name: 'SampleSiteOne'
          },
          method_technique: {
            name: 'MethodTechniqueOne'
          },
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2021-01-02',
          end_time: '12:00:00'
        }
      ] as any[];

      const rowValidatorParams = {
        samplePeriods: samplePeriods,
        sampleSites: [{ name: 'SampleSiteOne' }] as any[],
        methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
        utils: {
          getCellValue: getCellValueStub,
          getWorksheetHeader: () => 'HEADER'
        },
        samplePeriodId: 1
      } as any;

      const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

      const params = { row: {} } as any;

      const result = validator(params);

      expect(result.length).to.equal(0);
      expect(getSamplePeriodIdFromRowState(params.row).sample_period_id).to.equal(1);
    });

    describe('A: Observation date and time included', () => {
      it('A: should return an error when unable to uniquely match period', () => {
        const getCellValueStub = sinon.stub();

        getCellValueStub.onCall(0).returns(null);
        getCellValueStub.onCall(1).returns(null);
        getCellValueStub.onCall(2).returns('2021-01-01 - 2021-01-02');
        getCellValueStub.onCall(3).returns('2025-01-01');
        getCellValueStub.onCall(4).returns('11:00:00');

        const samplePeriods = [
          {
            survey_sample_period_id: 1,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          },
          {
            survey_sample_period_id: 2,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          }
        ] as any[];

        const rowValidatorParams = {
          samplePeriods: samplePeriods,
          sampleSites: [{ name: 'SampleSiteOne' }] as any[],
          methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
          utils: {
            getCellValue: getCellValueStub,
            getWorksheetHeader: () => 'HEADER'
          },
          samplePeriodId: undefined
        } as any;

        const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

        const result = validator({ row: {} } as any);

        expect(result.length).to.equal(2);
        expect(result[0].error).to.contain('period is ambiguous');
      });

      it('A: should return no errors and update state when able to uniquely match a period', () => {
        const getCellValueStub = sinon.stub();

        getCellValueStub.onCall(0).returns(null);
        getCellValueStub.onCall(1).returns(null);
        getCellValueStub.onCall(2).returns('2021-01-01 - 2021-01-02');
        getCellValueStub.onCall(3).returns('2021-01-01');
        getCellValueStub.onCall(4).returns('11:30:00');

        const samplePeriods = [
          {
            survey_sample_period_id: 1,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2022-01-01',
            end_date: '2022-01-02'
          },
          {
            survey_sample_period_id: 2,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          }
        ] as any[];

        const rowValidatorParams = {
          samplePeriods: samplePeriods,
          sampleSites: [{ name: 'SampleSiteOne', survey_sample_site_id: 2 }] as any[],
          methodTechniques: [{ name: 'MethodTechniqueOne', method_technique_id: 3 }] as any[],
          utils: {
            getCellValue: getCellValueStub,
            getWorksheetHeader: () => 'HEADER'
          },
          samplePeriodId: undefined
        } as any;

        const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

        const params = { row: {} } as any;

        const result = validator(params);

        expect(result.length).to.equal(0);
        expect(getSamplePeriodIdFromRowState(params.row).sample_period_id).to.equal(2);
      });

      it('A: should return errors when unable to uniquely match period with date and time', () => {
        const getCellValueStub = sinon.stub();

        getCellValueStub.onCall(0).returns(null);
        getCellValueStub.onCall(1).returns(null);
        getCellValueStub.onCall(2).returns('2021-01-01 - 2021-01-02');
        getCellValueStub.onCall(3).returns('2021-01-01');
        getCellValueStub.onCall(4).returns('11:30:00');

        const samplePeriods = [
          {
            survey_sample_period_id: 1,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            end_date: '2021-01-02'
          },
          {
            survey_sample_period_id: 2,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            end_date: '2021-01-02'
          }
        ] as any[];

        const rowValidatorParams = {
          samplePeriods: samplePeriods,
          sampleSites: [{ name: 'SampleSiteOne' }] as any[],
          methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
          utils: {
            getCellValue: getCellValueStub,
            getWorksheetHeader: () => 'HEADER'
          },
          samplePeriodId: undefined
        } as any;

        const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

        const params = { row: {} } as any;

        const result = validator(params);

        expect(result.length).to.equal(2);
        expect(result[0].error).to.contain('observation date and time');
      });
    });

    describe('B: Observation date and time not included but period contains time information', () => {
      it('B: should return an error when unable to uniquely match period', () => {
        const getCellValueStub = sinon.stub();

        getCellValueStub.onCall(0).returns(null);
        getCellValueStub.onCall(1).returns(null);
        getCellValueStub.onCall(2).returns('2021-01-01 11:00:00 - 2021-01-02 12:00:00');

        const samplePeriods = [
          {
            survey_sample_period_id: 1,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          },
          {
            survey_sample_period_id: 2,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          }
        ] as any[];

        const rowValidatorParams = {
          samplePeriods: samplePeriods,
          sampleSites: [{ name: 'SampleSiteOne' }] as any[],
          methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
          utils: {
            getCellValue: getCellValueStub,
            getWorksheetHeader: () => 'HEADER'
          },
          samplePeriodId: undefined
        } as any;

        const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

        const result = validator({ row: {} } as any);

        expect(result.length).to.equal(2);
        expect(result[0].error).to.contain('period is ambiguous');
      });

      it('B: should return no errors and update state when able to uniquely match a period', () => {
        const getCellValueStub = sinon.stub();

        getCellValueStub.onCall(0).returns(null);
        getCellValueStub.onCall(1).returns(null);
        getCellValueStub.onCall(2).returns('2021-01-01 11:00:00 - 2021-01-02 12:00:00');

        const samplePeriods = [
          {
            survey_sample_period_id: 1,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2022-01-01',
            end_date: '2022-01-02'
          },
          {
            survey_sample_period_id: 2,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          }
        ] as any[];

        const rowValidatorParams = {
          samplePeriods: samplePeriods,
          sampleSites: [{ name: 'SampleSiteOne', survey_sample_site_id: 2 }] as any[],
          methodTechniques: [{ name: 'MethodTechniqueOne', method_technique_id: 3 }] as any[],
          utils: {
            getCellValue: getCellValueStub,
            getWorksheetHeader: () => 'HEADER'
          },
          samplePeriodId: undefined
        } as any;

        const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

        const params = { row: {} } as any;

        const result = validator(params);

        expect(result.length).to.equal(0);
        expect(getSamplePeriodIdFromRowState(params.row).sample_period_id).to.equal(2);
      });

      it('B: should return errors when unable to uniquely match period with date and time', () => {
        const getCellValueStub = sinon.stub();

        getCellValueStub.onCall(0).returns(null);
        getCellValueStub.onCall(1).returns(null);
        getCellValueStub.onCall(2).returns('2021-01-01 11:00:00 - 2021-01-02 12:00:00');

        const samplePeriods = [
          {
            survey_sample_period_id: 1,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          },
          {
            survey_sample_period_id: 2,
            survey_sample_site: {
              name: 'SampleSiteOne'
            },
            method_technique: {
              name: 'MethodTechniqueOne'
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          }
        ] as any[];

        const rowValidatorParams = {
          samplePeriods: samplePeriods,
          sampleSites: [{ name: 'SampleSiteOne' }] as any[],
          methodTechniques: [{ name: 'MethodTechniqueOne' }] as any[],
          utils: {
            getCellValue: getCellValueStub,
            getWorksheetHeader: () => 'HEADER'
          },
          samplePeriodId: undefined
        } as any;

        const validator = getObservationSamplingInformationRowValidator(rowValidatorParams);

        const params = { row: {} } as any;

        const result = validator(params);

        expect(result.length).to.equal(2);
        expect(result[0].error).to.contain('period is ambiguous');
      });
    });
  });

  describe('matchSamplePeriodToWorksheetPeriod', () => {
    describe('sampling period record has date and time', () => {
      describe('returns true', () => {
        it('matches on date and time', () => {
          const worksheetPeriod = `2021-01-01 11:00:00 - 2021-01-02 12:00:00`;

          const samplingPeriod = {
            survey_sample_period_id: 11,
            survey_id: 21,
            survey_sample_site_id: 31,
            survey_sample_site: {
              survey_sample_site_id: 31,
              name: 'SampleSiteOne'
            },
            method_technique_id: 51,
            method_technique: {
              method_technique_id: 51,
              name: 'MethodTechniqueOne',
              description: 'MethodTechniqueOne Description',
              method_response_metric_id: 61
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          };

          const result = matchSamplePeriodToWorksheetPeriod(worksheetPeriod, samplingPeriod);

          expect(result).to.be.true;
        });

        it('matches on date, but not on time (time is ignored)', () => {
          const worksheetPeriod = `2021-01-01 - 2021-01-02`;

          const samplingPeriod = {
            survey_sample_period_id: 11,
            survey_id: 21,
            survey_sample_site_id: 31,
            survey_sample_site: {
              survey_sample_site_id: 31,
              name: 'SampleSiteOne'
            },
            method_technique_id: 51,
            method_technique: {
              method_technique_id: 51,
              name: 'MethodTechniqueOne',
              description: 'MethodTechniqueOne Description',
              method_response_metric_id: 61
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          };

          const result = matchSamplePeriodToWorksheetPeriod(worksheetPeriod, samplingPeriod);

          expect(result).to.be.true;
        });
      });

      describe('returns false', () => {
        it('worksheet period has no end date', () => {
          const worksheetPeriod = `2021-01-01 11:00:00`;

          const samplingPeriod = {
            survey_sample_period_id: 11,
            survey_id: 21,
            survey_sample_site_id: 31,
            survey_sample_site: {
              survey_sample_site_id: 31,
              name: 'SampleSiteOne'
            },
            method_technique_id: 51,
            method_technique: {
              method_technique_id: 51,
              name: 'MethodTechniqueOne',
              description: 'MethodTechniqueOne Description',
              method_response_metric_id: 61
            },
            start_date: '2021-01-01',
            start_time: '11:00:00',
            end_date: '2021-01-02',
            end_time: '12:00:00'
          };

          const result = matchSamplePeriodToWorksheetPeriod(worksheetPeriod, samplingPeriod);

          expect(result).to.be.false;
        });
      });
    });

    describe('sampling period record has date and no time', () => {
      describe('returns true', () => {
        it('matches on date', () => {
          const worksheetPeriod = `2021-01-01 - 2021-01-02`;

          const samplingPeriod = {
            survey_sample_period_id: 11,
            survey_id: 21,
            survey_sample_site_id: 31,
            survey_sample_site: {
              survey_sample_site_id: 31,
              name: 'SampleSiteOne'
            },
            method_technique_id: 51,
            method_technique: {
              method_technique_id: 51,
              name: 'MethodTechniqueOne',
              description: 'MethodTechniqueOne Description',
              method_response_metric_id: 61
            },
            start_date: '2021-01-01',
            start_time: null,
            end_date: '2021-01-02',
            end_time: null
          };

          const result = matchSamplePeriodToWorksheetPeriod(worksheetPeriod, samplingPeriod);

          expect(result).to.be.true;
        });
      });

      describe('returns false', () => {
        it('matches on date, but not on time', () => {
          const worksheetPeriod = `2021-01-01 11:00:00 - 2021-01-02 12:00:00`;

          const samplingPeriod = {
            survey_sample_period_id: 11,
            survey_id: 21,
            survey_sample_site_id: 31,
            survey_sample_site: {
              survey_sample_site_id: 31,
              name: 'SampleSiteOne'
            },
            method_technique_id: 51,
            method_technique: {
              method_technique_id: 51,
              name: 'MethodTechniqueOne',
              description: 'MethodTechniqueOne Description',
              method_response_metric_id: 61
            },
            start_date: '2021-01-01',
            start_time: null,
            end_date: '2021-01-02',
            end_time: null
          };

          const result = matchSamplePeriodToWorksheetPeriod(worksheetPeriod, samplingPeriod);

          expect(result).to.be.false;
        });

        it('worksheet period has no end date', () => {
          const worksheetPeriod = `2021-01-01`;

          const samplingPeriod = {
            survey_sample_period_id: 11,
            survey_id: 21,
            survey_sample_site_id: 31,
            survey_sample_site: {
              survey_sample_site_id: 31,
              name: 'SampleSiteOne'
            },
            method_technique_id: 51,
            method_technique: {
              method_technique_id: 51,
              name: 'MethodTechniqueOne',
              description: 'MethodTechniqueOne Description',
              method_response_metric_id: 61
            },
            start_date: '2021-01-01',
            start_time: null,
            end_date: '2021-01-02',
            end_time: null
          };

          const result = matchSamplePeriodToWorksheetPeriod(worksheetPeriod, samplingPeriod);

          expect(result).to.be.false;
        });
      });
    });
  });

  describe('matchSamplePeriodDateToWorksheetPeriodDateTime', () => {
    describe('returns true', () => {
      it('dates match 1', () => {
        const worksheetDateTime = '2021-01-01 11:00:00';
        const samplePeriodDate = '2021-01-01';

        const result = matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodDate);

        expect(result).to.be.true;
      });

      it('dates match 2', () => {
        const worksheetDateTime = '2021-01-01';
        const samplePeriodDate = '2021-01-01';

        const result = matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodDate);

        expect(result).to.be.true;
      });

      it('empty date information', () => {
        const worksheetDateTime = '';
        const samplePeriodDate = '';

        const result = matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodDate);

        expect(result).to.be.true;
      });

      it('both date formats are invalid', () => {
        const worksheetDateTime = 'invalid';
        const samplePeriodDate = 'bad';

        const result = matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodDate);

        expect(result).to.be.true;
      });
    });

    describe('should return false', () => {
      it('dates do not match', () => {
        const worksheetDateTime = '2021-01-01 11:00:00';
        const samplePeriodDate = '2022-02-02';

        const result = matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodDate);

        expect(result).to.be.false;
      });

      it('no worksheet date', () => {
        const worksheetDateTime = '';
        const samplePeriodDate = '2021-01-01';

        const result = matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodDate);

        expect(result).to.be.false;
      });

      it('no sampling period date', () => {
        const worksheetDateTime = '2021-01-01 11:00:00';
        const samplePeriodDate = '';

        const result = matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodDate);

        expect(result).to.be.false;
      });

      it('one date format is invalid 1', () => {
        const worksheetDateTime = '21 11:00:00';
        const samplePeriodDate = '2021-01-01';

        const result = matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodDate);

        expect(result).to.be.false;
      });

      it('one date is invalid 2', () => {
        const worksheetDateTime = '2021-01-01';
        const samplePeriodDate = '21';

        const result = matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodDate);

        expect(result).to.be.false;
      });
    });
  });

  describe('matchSamplePeriodTimeToWorksheetPeriodDateTime', () => {
    describe('returns true', () => {
      it('times match', () => {
        const worksheetDateTime = '2021-01-01 11:00:00';
        const samplePeriodTime = '11:00:00';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.true;
      });

      it('times match (no seconds in time format 1)', () => {
        const worksheetDateTime = '2021-01-01 11:00';
        const samplePeriodTime = '11:00:00';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.true;
      });

      it('times match (no seconds in time format 2)', () => {
        const worksheetDateTime = '2021-01-01 11:00:00';
        const samplePeriodTime = '11:00';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.true;
      });

      it('empty time information', () => {
        const worksheetDateTime = '';
        const samplePeriodTime = '';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.true;
      });

      it('both time formats are invalid', () => {
        const worksheetDateTime = '2021-01-01 invalid';
        const samplePeriodTime = 'bad';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.true;
      });
    });

    describe('should return false', () => {
      it('times do not match', () => {
        const worksheetDateTime = '2021-01-01 11:00:00';
        const samplePeriodTime = '12:00:00';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.false;
      });

      it('times do not match (no seconds in time format 1)', () => {
        const worksheetDateTime = '2021-01-01 11:00:00';
        const samplePeriodTime = '12:00';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.false;
      });

      it('times do not match (no seconds in time format 2)', () => {
        const worksheetDateTime = '2021-01-01 11:00';
        const samplePeriodTime = '12:00:00';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.false;
      });

      it('no worksheet time', () => {
        const worksheetDateTime = '2021-01-01';
        const samplePeriodTime = '11:00:00';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.false;
      });

      it('no sampling period time', () => {
        const worksheetDateTime = '2021-01-01 11:00:00';
        const samplePeriodTime = '';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.false;
      });

      it('one time format is invalid 1', () => {
        const worksheetDateTime = '2021-01-01 11:00:00';
        const samplePeriodTime = '11';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.false;
      });

      it('one time is invalid 2', () => {
        const worksheetDateTime = '2021-01-01 11';
        const samplePeriodTime = '11:00:00';

        const result = matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetDateTime, samplePeriodTime);

        expect(result).to.be.false;
      });
    });
  });

  describe('findMatchingPeriodsWithObservationDateTime', () => {
    it('matches no sampling period records when no sampling period records provided', () => {
      const observationDate = '2021-01-01';
      const observationTime = '11:00:00';
      const samplingPeriods: SurveySamplePeriodDetails[] = [];

      const result = findMatchingPeriodsWithObservationDateTime(observationDate, observationTime, samplingPeriods);

      expect(result).to.eql([]);
    });

    it('matches the start date/time of two period records', () => {
      const observationDate = '2021-01-01';
      const observationTime = '11:00:00';
      const samplingPeriods: SurveySamplePeriodDetails[] = [
        {
          survey_sample_period_id: 11,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 31,
            name: 'SampleSiteOne'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2021-01-02',
          end_time: '12:00:00'
        },
        {
          survey_sample_period_id: 12,
          survey_id: 21,
          survey_sample_site_id: 32,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2020-01-02',
          start_time: '12:00:00',
          end_date: '2020-02-03',
          end_time: '13:00:00'
        },
        {
          survey_sample_period_id: 13,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: null,
          method_technique: null,
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2021-01-02',
          end_time: '12:00:00'
        }
      ];

      const result = findMatchingPeriodsWithObservationDateTime(observationDate, observationTime, samplingPeriods);

      expect(result.length).to.equal(2);
      expect(result[0].survey_sample_period_id).to.equal(11);
      expect(result[1].survey_sample_period_id).to.equal(13);
    });

    it('matches the end date/time of two period records', () => {
      const observationDate = '2021-01-02';
      const observationTime = '12:00:00';
      const samplingPeriods: SurveySamplePeriodDetails[] = [
        {
          survey_sample_period_id: 11,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 31,
            name: 'SampleSiteOne'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2021-01-02',
          end_time: '12:00:00'
        },
        {
          survey_sample_period_id: 12,
          survey_id: 21,
          survey_sample_site_id: 32,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2020-01-02',
          start_time: '12:00:00',
          end_date: '2020-02-03',
          end_time: '13:00:00'
        },
        {
          survey_sample_period_id: 13,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: null,
          method_technique: null,
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2021-01-02',
          end_time: '12:00:00'
        }
      ];

      const result = findMatchingPeriodsWithObservationDateTime(observationDate, observationTime, samplingPeriods);

      expect(result.length).to.equal(2);
      expect(result[0].survey_sample_period_id).to.equal(11);
      expect(result[1].survey_sample_period_id).to.equal(13);
    });

    it('matches the date range of two period records on date and time', () => {
      const observationDate = '2021-01-05';
      const observationTime = '18:00:00';
      const samplingPeriods: SurveySamplePeriodDetails[] = [
        {
          survey_sample_period_id: 11,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 31,
            name: 'SampleSiteOne'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2021-01-01',
          start_time: '13:00:00',
          end_date: '2021-01-10',
          end_time: '22:00:00'
        },
        {
          survey_sample_period_id: 12,
          survey_id: 21,
          survey_sample_site_id: 32,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2020-01-02',
          start_time: '12:00:00',
          end_date: '2020-02-03',
          end_time: '13:00:00'
        },
        {
          survey_sample_period_id: 13,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: null,
          method_technique: null,
          start_date: '2021-01-04',
          start_time: '08:00:00',
          end_date: '2021-01-20',
          end_time: '04:00:00'
        }
      ];

      const result = findMatchingPeriodsWithObservationDateTime(observationDate, observationTime, samplingPeriods);

      expect(result.length).to.equal(2);
      expect(result[0].survey_sample_period_id).to.equal(11);
      expect(result[1].survey_sample_period_id).to.equal(13);
    });

    it('matches the date range of two period records on date', () => {
      const observationDate = '2021-01-05';
      const observationTime = null;
      const samplingPeriods: SurveySamplePeriodDetails[] = [
        {
          survey_sample_period_id: 11,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 31,
            name: 'SampleSiteOne'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2021-01-01',
          start_time: '13:00:00',
          end_date: '2021-01-10',
          end_time: '22:00:00'
        },
        {
          survey_sample_period_id: 12,
          survey_id: 21,
          survey_sample_site_id: 32,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2020-01-02',
          start_time: '12:00:00',
          end_date: '2020-02-03',
          end_time: '13:00:00'
        },
        {
          survey_sample_period_id: 13,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: null,
          method_technique: null,
          start_date: '2021-01-04',
          start_time: '08:00:00',
          end_date: '2021-01-20',
          end_time: '04:00:00'
        }
      ];

      const result = findMatchingPeriodsWithObservationDateTime(observationDate, observationTime, samplingPeriods);

      expect(result.length).to.equal(2);
      expect(result[0].survey_sample_period_id).to.equal(11);
      expect(result[1].survey_sample_period_id).to.equal(13);
    });

    it('does not matche the date range of any period records on date and time', () => {
      const observationDate = '2021-01-20';
      const observationTime = '05:00:00';
      const samplingPeriods: SurveySamplePeriodDetails[] = [
        {
          survey_sample_period_id: 11,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 31,
            name: 'SampleSiteOne'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2021-01-01',
          start_time: '13:00:00',
          end_date: '2021-01-10',
          end_time: '22:00:00'
        },
        {
          survey_sample_period_id: 12,
          survey_id: 21,
          survey_sample_site_id: 32,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2020-01-02',
          start_time: '12:00:00',
          end_date: '2020-02-03',
          end_time: '13:00:00'
        },
        {
          survey_sample_period_id: 13,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: null,
          method_technique: null,
          start_date: '2021-01-04',
          start_time: '08:00:00',
          end_date: '2021-01-20',
          end_time: '04:00:00'
        }
      ];

      const result = findMatchingPeriodsWithObservationDateTime(observationDate, observationTime, samplingPeriods);

      expect(result).to.eql([]);
    });

    it('does not matche the date range of any period records on date', () => {
      const observationDate = '2021-01-28';
      const observationTime = null;
      const samplingPeriods: SurveySamplePeriodDetails[] = [
        {
          survey_sample_period_id: 11,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 31,
            name: 'SampleSiteOne'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2021-01-01',
          start_time: '13:00:00',
          end_date: '2021-01-10',
          end_time: '22:00:00'
        },
        {
          survey_sample_period_id: 12,
          survey_id: 21,
          survey_sample_site_id: 32,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: 51,
          method_technique: {
            method_technique_id: 51,
            name: 'MethodTechniqueOne',
            description: 'MethodTechniqueOne Description',
            method_response_metric_id: 61
          },
          start_date: '2020-01-02',
          start_time: '12:00:00',
          end_date: '2020-02-03',
          end_time: '13:00:00'
        },
        {
          survey_sample_period_id: 13,
          survey_id: 21,
          survey_sample_site_id: 31,
          survey_sample_site: {
            survey_sample_site_id: 32,
            name: 'SampleSiteTwo'
          },
          method_technique_id: null,
          method_technique: null,
          start_date: '2021-01-04',
          start_time: '08:00:00',
          end_date: '2021-01-20',
          end_time: '04:00:00'
        }
      ];

      const result = findMatchingPeriodsWithObservationDateTime(observationDate, observationTime, samplingPeriods);

      expect(result).to.eql([]);
    });
  });

  describe('validateSiteExistsInSurveySampleSiteMap', () => {
    it('should return an error when site name does not exist in sample periods', () => {
      const sampleSiteMap = new Map([['SampleSiteOne', 1]]);

      const error = validateSiteExistsInSurveySampleSiteMap('bad', 'HEADER', sampleSiteMap);

      expect(error?.error).to.contain('not exist');
    });

    it('should return null when site name exists in sample periods', () => {
      const sampleSiteMap = new Map([['SampleSiteOne', 1]]);

      const error = validateSiteExistsInSurveySampleSiteMap('SampleSiteOne', 'HEADER', sampleSiteMap);

      expect(error).to.be.null;
    });

    it('should return null when sample site name is null', () => {
      const sampleSiteMap = new Map([['SampleSiteOne', 1]]);

      const error = validateSiteExistsInSurveySampleSiteMap(null, 'HEADER', sampleSiteMap);

      expect(error).to.be.null;
    });
  });

  describe('validateTechniqueExistsInSurveyTechniqueMap', () => {
    it('should return an error when method technique does not exist in sample periods', () => {
      const methodTechniqueMap = new Map([['MethodTechniqueOne', 1]]);

      const error = validateTechniqueExistsInSurveyTechniqueMap('bad', 'HEADER', methodTechniqueMap);

      expect(error?.error).to.contain('not exist');
    });

    it('should return null when method technique exists in sample periods', () => {
      const methodTechniqueMap = new Map([['MethodTechniqueOne', 1]]);

      const error = validateTechniqueExistsInSurveyTechniqueMap('MethodTechniqueOne', 'HEADER', methodTechniqueMap);

      expect(error).to.be.null;
    });

    it('should return null when method technique name is null', () => {
      const methodTechniqueMap = new Map([['MethodTechniqueOne', 1]]);

      const error = validateTechniqueExistsInSurveyTechniqueMap(null, 'HEADER', methodTechniqueMap);

      expect(error).to.be.null;
    });
  });

  describe('findMatchingPeriodWithSamplePeriodId', () => {
    it('should return true when match found', () => {
      const samplePeriods = [{ survey_sample_period_id: 1 }] as any[];

      const result = findMatchingPeriodWithSamplePeriodId(samplePeriods, 1);

      expect(result).to.be.true;
    });

    it('should return false when match not found', () => {
      const samplePeriods = [{ survey_sample_period_id: 1 }] as any[];

      const result = findMatchingPeriodWithSamplePeriodId(samplePeriods, 2);

      expect(result).to.be.false;
    });
  });
});
