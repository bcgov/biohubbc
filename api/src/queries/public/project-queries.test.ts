import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getPublicProjectSQL,
  getActivitiesByPublicProjectSQL,
  getPublicProjectListSQL,
  getPublicProjectAttachmentsSQL,
  getPublicProjectAttachmentS3KeySQL,
  getPublicProjectReportAttachmentsSQL,
  getPublicProjectReportAttachmentS3KeySQL,
  getPublicProjectReportAttachmentSQL,
  getProjectReportAuthorsSQL
} from './project-queries';

describe('getPublicProjectSQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getPublicProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid project id param provided', () => {
    const response = getPublicProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getActivitiesByPublicProjectSQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getActivitiesByPublicProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid project id param provided', () => {
    const response = getActivitiesByPublicProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getPublicProjectListSQL', () => {
  it('returns non null response when called', () => {
    const response = getPublicProjectListSQL();

    expect(response).to.not.be.null;
  });
});

describe('getPublicProjectAttachmentsSQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getPublicProjectAttachmentsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid project id param provided', () => {
    const response = getPublicProjectAttachmentsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getPublicProjectReportAttachmentsSQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getPublicProjectReportAttachmentsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid project id param provided', () => {
    const response = getPublicProjectReportAttachmentsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getPublicProjectReportAttachmentS3KeySQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getPublicProjectReportAttachmentS3KeySQL((null as unknown) as number, 2);

    expect(response).to.be.null;
  });

  it('returns null when null attachment id param provided', () => {
    const response = getPublicProjectReportAttachmentS3KeySQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid attachment id param provided', () => {
    const response = getPublicProjectReportAttachmentS3KeySQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('getPublicProjectAttachmentS3KeySQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getPublicProjectAttachmentS3KeySQL((null as unknown) as number, 2);

    expect(response).to.be.null;
  });

  it('returns null when null attachment id param provided', () => {
    const response = getPublicProjectAttachmentS3KeySQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getPublicProjectAttachmentS3KeySQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('getPublicProjectReportAttachmentSQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getPublicProjectReportAttachmentSQL((null as unknown) as number, 2);

    expect(response).to.be.null;
  });

  it('returns null when null attachment id param provided', () => {
    const response = getPublicProjectReportAttachmentSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getPublicProjectReportAttachmentSQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('getProjectReportAuthorSQL', () => {
  it('returns null response when null projectReportAttachmentId provided', () => {
    const response = getProjectReportAuthorsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectReportAttachmentId provided', () => {
    const response = getProjectReportAuthorsSQL(1);

    expect(response).to.not.be.null;
  });
});
