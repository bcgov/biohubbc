import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getSurveyAttachmentByFileNameSQL,
  postSurveyAttachmentSQL,
  putSurveyAttachmentSQL
} from './survey-attachments-queries';

describe('postSurveyAttachmentSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = postSurveyAttachmentSQL('name', 20, 'type', (null as unknown) as number, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = postSurveyAttachmentSQL((null as unknown) as string, 20, 'type', 1, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null fileSize provided', () => {
    const response = postSurveyAttachmentSQL('name', (null as unknown) as number, 'type', 1, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null surveyId provided', () => {
    const response = postSurveyAttachmentSQL('name', 20, 'type', 1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = postSurveyAttachmentSQL('name', 20, 'type', 1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns null response when null fileType provided', () => {
    const response = postSurveyAttachmentSQL('name', 20, (null as unknown) as string, 1, 'key');

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = postSurveyAttachmentSQL('name', 20, 'type', 1, 'key');

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
    const response = putSurveyAttachmentSQL((null as unknown) as number, 'name', 'type');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = putSurveyAttachmentSQL(1, (null as unknown) as string, 'type');

    expect(response).to.be.null;
  });

  it('returns null response when null fileType provided', () => {
    const response = putSurveyAttachmentSQL(1, 'name', (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = putSurveyAttachmentSQL(1, 'name', 'type');

    expect(response).to.not.be.null;
  });
});
