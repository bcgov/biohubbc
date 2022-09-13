import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getAllAssignablePermitsForASurveySQL,
  getAttachmentsBySurveySQL,
  getLatestOccurrenceSubmissionIdSQL,
  getLatestSummaryResultIdSQL,
  getReportAttachmentsBySurveySQL,
  getSurveyBasicDataForViewSQL,
  getSurveyFocalSpeciesDataForViewSQL,
  getSurveyFundingSourcesDataForViewSQL,
  getSurveyIdsSQL
} from './survey-view-queries';

describe('getAllAssignablePermitsForASurveySQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getAllAssignablePermitsForASurveySQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getAllAssignablePermitsForASurveySQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyIdsSQL', () => {
  it('returns a sql statement', () => {
    const response = getSurveyIdsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyBasicDataForViewSQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getSurveyBasicDataForViewSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyBasicDataForViewSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyFundingSourcesDataForViewSQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getSurveyFundingSourcesDataForViewSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyFundingSourcesDataForViewSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyFocalSpeciesDataForViewSQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getSurveyFocalSpeciesDataForViewSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyFocalSpeciesDataForViewSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getLatestOccurrenceSubmissionIdSQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getLatestOccurrenceSubmissionIdSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getLatestOccurrenceSubmissionIdSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getLatestSummaryResultIdSQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getLatestSummaryResultIdSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getLatestSummaryResultIdSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getAttachmentsBySurveySQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getAttachmentsBySurveySQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getAttachmentsBySurveySQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getReportAttachmentsBySurveySQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getReportAttachmentsBySurveySQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getReportAttachmentsBySurveySQL(1);

    expect(response).to.not.be.null;
  });
});
