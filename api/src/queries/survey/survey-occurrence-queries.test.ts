import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteSurveyOccurrencesSQL,
  getLatestSurveyOccurrenceSubmissionSQL,
  getOccurrenceSubmissionMessagesSQL,
  getSurveyOccurrenceSubmissionSQL,
  getTemplateMethodologySpeciesIdSQLStatement,
  getValidationSchemaSQL,
  insertSurveyOccurrenceSubmissionSQL,
  insertOccurrenceSubmissionMessageSQL,
  insertOccurrenceSubmissionStatusSQL,
  updateSurveyOccurrenceSubmissionWithKeySQL,
  deleteOccurrenceSubmissionSQL
} from './survey-occurrence-queries';

describe('insertSurveyOccurrenceSubmissionSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL((null as unknown) as number, 'fileSource', 'fileKey', 1);

    expect(response).to.be.null;
  });

  it('returns null response when null source provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL(1, (null as unknown) as string, 'fileKey', 1);

    expect(response).to.be.null;
  });

  it('returns null response when null fileKey provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL(1, 'fileSource', (null as unknown) as string, 1);

    expect(response).to.be.null;
  });

  it('returns non null response when null templateMethodologyId provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL(1, 'fileSource', 'fileKey', null);

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL(1, 'fileSource', 'fileKey', 1);

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

describe('updateSurveyOccurrenceSubmissionwithKeySQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = updateSurveyOccurrenceSubmissionWithKeySQL((null as unknown) as number, 'fileKey');

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = updateSurveyOccurrenceSubmissionWithKeySQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = updateSurveyOccurrenceSubmissionWithKeySQL(1, 'fileKey');

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

describe('getTemplateMethodologySpeciesIdSQLStatement', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getTemplateMethodologySpeciesIdSQLStatement((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getTemplateMethodologySpeciesIdSQLStatement(1);

    expect(response).to.not.be.null;
  });
});

describe('getValidationSchemaSQL', () => {
  it('returns null response when null occurrenceId provided', () => {
    const response = getValidationSchemaSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getValidationSchemaSQL(1);

    expect(response).to.not.be.null;
  });
});
