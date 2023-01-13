import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteOccurrenceSubmissionSQL,
  insertSurveyOccurrenceSubmissionSQL,
  updateSurveyOccurrenceSubmissionSQL
} from './survey-occurrence-queries';

describe('insertSurveyOccurrenceSubmissionSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL({
      surveyId: (null as unknown) as number,
      source: 'fileSource',
      inputKey: 'fileKey'
    });

    expect(response).to.be.null;
  });

  it('returns null response when null source provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL({
      surveyId: 1,
      source: (null as unknown) as string,
      inputKey: 'fileKey'
    });

    expect(response).to.be.null;
  });

  it('returns non null response when all valid params provided without inputKey', () => {
    const response = insertSurveyOccurrenceSubmissionSQL({
      surveyId: 1,
      source: 'fileSource',
      inputFileName: 'inputFileName',
      outputFileName: 'outputFileName',
      outputKey: 'outputfileKey'
    });

    expect(response).to.not.be.null;
  });

  it('returns non null response when all valid params provided with inputKey', () => {
    const response = insertSurveyOccurrenceSubmissionSQL({
      surveyId: 1,
      source: 'fileSource',
      inputFileName: 'inputFileName',
      inputKey: 'inputfileKey',
      outputFileName: 'outputFileName',
      outputKey: 'outputfileKey'
    });

    expect(response).to.not.be.null;
  });
});

describe('deleteOccurrenceSubmissionSQL', () => {
  it('returns null response when null submissionId provided', () => {
    const response = deleteOccurrenceSubmissionSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = deleteOccurrenceSubmissionSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('updateSurveyOccurrenceSubmissionSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = updateSurveyOccurrenceSubmissionSQL({
      submissionId: (null as unknown) as number,
      inputKey: 'fileKey'
    });

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = updateSurveyOccurrenceSubmissionSQL({
      submissionId: 1,
      inputKey: (null as unknown) as string
    });

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = updateSurveyOccurrenceSubmissionSQL({
      submissionId: 1,
      inputKey: 'fileKey',
      inputFileName: 'fileName',
      outputFileName: 'outputFileName',
      outputKey: 'outputKey'
    });

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid params provided without inputKey', () => {
    const response = updateSurveyOccurrenceSubmissionSQL({
      submissionId: 1,
      inputKey: 'fileKey'
    });

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid params provided without inputFileName', () => {
    const response = updateSurveyOccurrenceSubmissionSQL({
      submissionId: 1,
      inputFileName: 'fileName'
    });

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid params provided without outputFileName', () => {
    const response = updateSurveyOccurrenceSubmissionSQL({
      submissionId: 1,
      outputFileName: 'outputFileName'
    });

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid params provided without outputKey', () => {
    const response = updateSurveyOccurrenceSubmissionSQL({
      submissionId: 1,
      outputKey: 'outputKey'
    });

    expect(response).to.not.be.null;
  });
});
