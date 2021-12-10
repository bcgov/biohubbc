import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteSurveyOccurrencesSQL,
  getLatestSurveyOccurrenceSubmissionSQL,
  getOccurrenceSubmissionMessagesSQL,
  getSurveyOccurrenceSubmissionSQL,
  //getTemplateMethodologySpeciesRecordSQL,
  insertSurveyOccurrenceSubmissionSQL,
  insertOccurrenceSubmissionMessageSQL,
  insertOccurrenceSubmissionStatusSQL,
  updateSurveyOccurrenceSubmissionSQL,
  deleteOccurrenceSubmissionSQL
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

describe('getLatestSurveyOccurrenceSubmission', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getLatestSurveyOccurrenceSubmissionSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getLatestSurveyOccurrenceSubmissionSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyOccurrencesSQL', () => {
  it('returns null response when null occurrenceSubmissionId provided', () => {
    const response = deleteSurveyOccurrencesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = deleteSurveyOccurrencesSQL(1);

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

describe('getSurveyOccurrenceSubmissionSQL', () => {
  it('returns null response when null occurrenceSubmissionId provided', () => {
    const response = getSurveyOccurrenceSubmissionSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getSurveyOccurrenceSubmissionSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('insertSurveySubmissionStatusSQL', () => {
  it('returns null response when null occurrenceSubmissionId provided', () => {
    const response = insertOccurrenceSubmissionStatusSQL((null as unknown) as number, 'type');

    expect(response).to.be.null;
  });

  it('returns null response when null submissionStatusType provided', () => {
    const response = insertOccurrenceSubmissionStatusSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = insertOccurrenceSubmissionStatusSQL(1, 'type');

    expect(response).to.not.be.null;
  });
});

describe('insertSurveySubmissionMessageSQL', () => {
  it('returns null response when null occurrenceSubmissionId provided', () => {
    const response = insertOccurrenceSubmissionMessageSQL((null as unknown) as number, 'type', 'message', 'errorcode');

    expect(response).to.be.null;
  });

  it('returns null response when null submissionStatusType provided', () => {
    const response = insertOccurrenceSubmissionMessageSQL(1, (null as unknown) as string, 'message', 'errorcode');

    expect(response).to.be.null;
  });

  it('returns null response when null submissionMessage provided', () => {
    const response = insertOccurrenceSubmissionMessageSQL(1, 'type', (null as unknown) as string, 'errorcode');

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = insertOccurrenceSubmissionMessageSQL(1, 'type', 'message', 'errorcode');

    expect(response).to.not.be.null;
  });
});

describe('getOccurrenceSubmissionMessagesSQL', () => {
  it('returns null response when null occurrenceSubmissionId provided', () => {
    const response = getOccurrenceSubmissionMessagesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getOccurrenceSubmissionMessagesSQL(1);

    expect(response).to.not.be.null;
  });
});
