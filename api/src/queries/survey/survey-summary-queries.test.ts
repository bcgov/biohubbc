import { expect } from 'chai';
import { describe } from 'mocha';
import { PostSummaryDetails } from '../../models/summaryresults-create';
import {
  insertSurveySummarySubmissionSQL,
  getLatestSurveySummarySubmissionSQL,
  updateSurveySummarySubmissionWithKeySQL,
  getSurveySummarySubmissionSQL,
  insertSurveySummaryDetailsSQL
} from './survey-summary-queries';

describe('insertSurveySummarySubmissionSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = insertSurveySummarySubmissionSQL((null as unknown) as number, 'fileSource', 'fileKey');

    expect(response).to.be.null;
  });

  it('returns null response when null source provided', () => {
    const response = insertSurveySummarySubmissionSQL(1, (null as unknown) as string, 'fileKey');

    expect(response).to.be.null;
  });

  it('returns null response when null fileKey provided', () => {
    const response = insertSurveySummarySubmissionSQL(1, 'fileSource', (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = insertSurveySummarySubmissionSQL(1, 'fileSource', 'fileKey');

    expect(response).to.not.be.null;
  });
});

describe('getLatestSurveySummarySubmissionSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getLatestSurveySummarySubmissionSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getLatestSurveySummarySubmissionSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('updateSurveySummarySubmissionWithKeySQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = updateSurveySummarySubmissionWithKeySQL((null as unknown) as number, 'fileKey');

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = updateSurveySummarySubmissionWithKeySQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = updateSurveySummarySubmissionWithKeySQL(1, 'fileKey');

    expect(response).to.not.be.null;
  });
});

describe('getSurveySummarySubmissionSQL', () => {
  it('returns null response when null occurrenceSubmissionId provided', () => {
    const response = getSurveySummarySubmissionSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getSurveySummarySubmissionSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('insertSurveySummaryDetailsSQL', () => {
  const obj = {
    study_area_id: 'area_name',
    parameter: 'density',
    stratum: 'S1',
    parameter_value: 18,
    parameter_estimate: 100,
    standard_error: 166.4,
    coefficient_variation: 0.4,
    confidence_level_percent: 0.9,
    confidence_limit_upper: 143.8,
    confidence_limit_lower: 0.1,
    kilometres_surveyed: 10,
    total_area_surveyed_sqm: 10
  };
  const summaryDetailsData = new PostSummaryDetails(obj);

  it('returns null response when null summarySubmissionId provided', () => {
    const response = insertSurveySummaryDetailsSQL((null as unknown) as number, summaryDetailsData);

    expect(response).to.be.null;
  });

  it('returns null response when null summaryDetailsData provided', () => {
    const response = insertSurveySummaryDetailsSQL(1, (null as unknown) as PostSummaryDetails);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = insertSurveySummaryDetailsSQL(1, summaryDetailsData);

    expect(response).to.not.be.null;
  });
});
