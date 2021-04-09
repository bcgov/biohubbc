import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getProjectAttachmentsSQL,
  deleteProjectAttachmentSQL,
  getProjectAttachmentS3KeySQL,
  postProjectAttachmentSQL,
  getProjectAttachmentByFileNameSQL,
  putProjectAttachmentSQL
} from './project-attachments-queries';

describe('getProjectAttachmentsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectAttachmentsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getProjectAttachmentsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteProjectAttachmentSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = deleteProjectAttachmentSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and attachmentId provided', () => {
    const response = deleteProjectAttachmentSQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('getProjectAttachmentS3KeySQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectAttachmentS3KeySQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = getProjectAttachmentS3KeySQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and attachmentId provided', () => {
    const response = getProjectAttachmentS3KeySQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('postProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = postProjectAttachmentSQL('name', 20, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = postProjectAttachmentSQL((null as unknown) as string, 20, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null fileSize provided', () => {
    const response = postProjectAttachmentSQL('name', (null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName and fileSize provided', () => {
    const response = postProjectAttachmentSQL('name', 20, 1);

    expect(response).to.not.be.null;
  });
});

describe('getProjectAttachmentByFileNameSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectAttachmentByFileNameSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = getProjectAttachmentByFileNameSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName provided', () => {
    const response = getProjectAttachmentByFileNameSQL(1, 'name');

    expect(response).to.not.be.null;
  });
});

describe('putProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = putProjectAttachmentSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = putProjectAttachmentSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName provided', () => {
    const response = putProjectAttachmentSQL(1, 'name');

    expect(response).to.not.be.null;
  });
});
