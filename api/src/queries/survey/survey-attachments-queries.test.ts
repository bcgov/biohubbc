import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getSurveyAttachmentsSQL,
  deleteSurveyAttachmentSQL,
  getSurveyAttachmentS3KeySQL,
  postSurveyAttachmentSQL,
  getSurveyAttachmentByFileNameSQL,
  putSurveyAttachmentSQL
} from './survey-attachments-queries';

describe('getSurveyAttachmentsSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getSurveyAttachmentsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId provided', () => {
    const response = getSurveyAttachmentsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyAttachmentSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = deleteSurveyAttachmentSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = deleteSurveyAttachmentSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId and attachmentId provided', () => {
    const response = deleteSurveyAttachmentSQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyAttachmentS3KeySQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getSurveyAttachmentS3KeySQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = getSurveyAttachmentS3KeySQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId and attachmentId provided', () => {
    const response = getSurveyAttachmentS3KeySQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('postSurveyAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = postSurveyAttachmentSQL('name', 20, (null as unknown) as number, 1, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = postSurveyAttachmentSQL((null as unknown) as string, 20, 1, 1, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null fileSize provided', () => {
    const response = postSurveyAttachmentSQL('name', (null as unknown) as number, 1, 1, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null surveyId provided', () => {
    const response = postSurveyAttachmentSQL('name', 20, 1, (null as unknown) as number, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = postSurveyAttachmentSQL('name', 20, 1, (null as unknown) as number, (null as unknown) as any);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and surveyId and fileName and fileSize provided', () => {
    const response = postSurveyAttachmentSQL('name', 20, 1, 1, 'key');

    expect(response).to.not.be.null;
  });
});

describe('getSurveyAttachmentByFileNameSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getSurveyAttachmentByFileNameSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = getSurveyAttachmentByFileNameSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId and fileName provided', () => {
    const response = getSurveyAttachmentByFileNameSQL(1, 'name');

    expect(response).to.not.be.null;
  });
});

describe('putSurveyAttachmentSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = putSurveyAttachmentSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = putSurveyAttachmentSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId and fileName provided', () => {
    const response = putSurveyAttachmentSQL(1, 'name');

    expect(response).to.not.be.null;
  });
});
