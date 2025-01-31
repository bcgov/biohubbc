import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { SurveySamplePeriodDetails } from '../../repositories/sample-period-repository';
import { CSV_COLUMN_ALIASES } from '../../utils/xlsx-utils/column-aliases';
import {
  matchSamplePeriodDateToWorksheetPeriodDateTime,
  matchSamplePeriodsToObservationDateTime,
  matchSamplePeriodTimeToWorksheetPeriodDateTime,
  matchSamplePeriodToWorksheetPeriod,
  pullSamplingDataFromWorksheetRowObject
} from './utils';

chai.use(sinonChai);

describe('Worksheet sampling util functions', () => {
  describe('pullSamplingDataFromWorksheetRowObject', () => {
    describe('scenario 1 - all periods partially overlap', () => {
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
          start_date: '2021-01-02',
          start_time: '12:00:00',
          end_date: '2021-01-03',
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

      it('matches on site, technique, period', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: 'SampleSiteOne',
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: 'MethodTechniqueOne',
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: '2021-01-01 11:00:00 - 2021-01-02 12:00:00'
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        expect(result?.samplePeriodId).to.equal(11);
      });
    });

    describe('scenario 2 - all periods differ only by date', () => {
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
          start_date: '2022-01-01',
          start_time: '11:00:00',
          end_date: '2022-01-02',
          end_time: '12:00:00'
        },
        {
          survey_sample_period_id: 13,
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
          start_date: '2023-01-01',
          start_time: '11:00:00',
          end_date: '2023-01-02',
          end_time: '12:00:00'
        }
      ];

      it('does not match on site, technique', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: 'SampleSiteOne',
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: 'MethodTechniqueOne',
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: null
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        expect(result).to.be.null;
      });

      it('Matches on observation date and time', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: null,
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: null,
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: null,
          DATE: '2022-01-01',
          TIME: '18:00:00'
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        expect(result?.samplePeriodId).to.equal(12);
      });

      it('matches on site, technique, period', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: 'SampleSiteOne',
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: 'MethodTechniqueOne',
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: '2021-01-01 11:00:00 - 2021-01-02 12:00:00'
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        expect(result?.samplePeriodId).to.equal(11);
      });

      it('matches on period', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: 'SampleSiteOne',
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: 'MethodTechniqueOne',
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: '2021-01-01 11:00:00 - 2021-01-02 12:00:00'
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        expect(result?.samplePeriodId).to.equal(11);
      });
    });

    describe('scenario 2 - all periods differ only by site and technique', () => {
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
            name: 'MethodTechniqueTwo',
            description: 'MethodTechniqueTwo Description',
            method_response_metric_id: 61
          },
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2022-02-02',
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
          method_technique_id: 52,
          method_technique: {
            method_technique_id: 52,
            name: 'MethodTechniqueTwo',
            description: 'MethodTechniqueTwo Description',
            method_response_metric_id: 62
          },
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2022-02-02',
          end_time: '12:00:00'
        },
        {
          survey_sample_period_id: 13,
          survey_id: 21,
          survey_sample_site_id: 33,
          survey_sample_site: {
            survey_sample_site_id: 33,
            name: 'SampleSiteThree'
          },
          method_technique_id: 53,
          method_technique: {
            method_technique_id: 53,
            name: 'MethodTechniqueThree',
            description: 'MethodTechniqueThree Description',
            method_response_metric_id: 63
          },
          start_date: '2021-01-01',
          start_time: '11:00:00',
          end_date: '2022-02-02',
          end_time: '12:00:00'
        }
      ];

      it('does not match on site, technique', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: 'SampleSiteOne',
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: 'MethodTechniqueOne',
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: null
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        expect(result).to.be.null;
      });

      it('Matches non-unique period on observation date and time', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: null,
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: null,
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: null,
          DATE: '2021-05-15',
          TIME: '18:00:00'
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        // Matches multiple periods on observation date/time, therefore the first match is returned
        expect(result?.samplePeriodId).to.equal(11);
      });

      it('does not match non-unique period on site, technique, period', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: 'SampleSiteOne',
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: 'MethodTechniqueOne',
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: '2021-01-01 11:00:00 - 2022-02-02 12:00:00'
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        // Matches multiple periods on sampling information, therefore null is returned
        expect(result).to.be.null;
      });
    });

    describe('scenario 3 - all periods are unique', () => {
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
          method_technique_id: 52,
          method_technique: {
            method_technique_id: 52,
            name: 'MethodTechniqueTwo',
            description: 'MethodTechniqueTwo Description',
            method_response_metric_id: 62
          },
          start_date: '2021-01-02',
          start_time: '12:00:00',
          end_date: '2021-01-03',
          end_time: '13:00:00'
        },
        {
          survey_sample_period_id: 13,
          survey_id: 21,
          survey_sample_site_id: null,
          survey_sample_site: null,
          method_technique_id: null,
          method_technique: null,
          start_date: '2021-01-03',
          start_time: null,
          end_date: '2021-01-04',
          end_time: null
        }
      ];

      it('matches on site', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: 'SampleSiteOne',
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: null,
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: null
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        expect(result?.samplePeriodId).to.equal(11);
      });

      it('matches on technique', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: null,
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: 'MethodTechniqueOne',
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: null
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        expect(result?.samplePeriodId).to.equal(11);
      });

      it('matches on period', () => {
        const worksheetRow = {
          [CSV_COLUMN_ALIASES['SAMPLING_SITE'][0]]: null,
          [CSV_COLUMN_ALIASES['METHOD_TECHNIQUE'][0]]: null,
          [CSV_COLUMN_ALIASES['SAMPLING_PERIOD'][0]]: '2021-01-01 11:00:00 - 2021-01-02 12:00:00'
        };

        const result = pullSamplingDataFromWorksheetRowObject(worksheetRow, samplingPeriods);

        expect(result?.samplePeriodId).to.equal(11);
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
      });

      describe('returns false', () => {
        it('matches on date, but not on time', () => {
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

          expect(result).to.be.false;
        });

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

  describe('matchSamplePeriodsToObservationDateTime', () => {
    it('matches no sampling period records when no sampling period records provided', () => {
      const observationDate = '2021-01-01';
      const observationTime = '11:00:00';
      const samplingPeriods: SurveySamplePeriodDetails[] = [];

      const result = matchSamplePeriodsToObservationDateTime(observationDate, observationTime, samplingPeriods);

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

      const result = matchSamplePeriodsToObservationDateTime(observationDate, observationTime, samplingPeriods);

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

      const result = matchSamplePeriodsToObservationDateTime(observationDate, observationTime, samplingPeriods);

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

      const result = matchSamplePeriodsToObservationDateTime(observationDate, observationTime, samplingPeriods);

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

      const result = matchSamplePeriodsToObservationDateTime(observationDate, observationTime, samplingPeriods);

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

      const result = matchSamplePeriodsToObservationDateTime(observationDate, observationTime, samplingPeriods);

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

      const result = matchSamplePeriodsToObservationDateTime(observationDate, observationTime, samplingPeriods);

      expect(result).to.eql([]);
    });
  });
});
