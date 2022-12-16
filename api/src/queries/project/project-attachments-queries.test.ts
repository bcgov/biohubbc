import { expect } from 'chai';
import { describe } from 'mocha';
import { PutReportAttachmentMetadata } from '../../models/project-survey-attachments';
import {
  deleteProjectAttachmentSQL,
  deleteProjectReportAttachmentSQL,
  getProjectAttachmentS3KeySQL,
  getProjectReportAttachmentS3KeySQL,
  updateProjectReportAttachmentMetadataSQL
} from './project-attachments-queries';

const put_sample_attachment_meta = {
  title: 'title',
  year_published: 2000,
  authors: [
    {
      first_name: 'John',
      last_name: 'Smith'
    }
  ],
  description: 'description',
  revision_count: 0
};

describe('deleteProjectAttachmentSQL', () => {
  it('returns null response when null attachmentId provided', () => {
    const response = deleteProjectAttachmentSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid attachmentId provided', () => {
    const response = deleteProjectAttachmentSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectReportAttachmentSQL', () => {
  it('returns null response when null attachmentId provided', () => {
    const response = deleteProjectReportAttachmentSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid attachmentId provided', () => {
    const response = deleteProjectReportAttachmentSQL(1);

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

describe('getProjectReportAttachmentS3KeySQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectReportAttachmentS3KeySQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = getProjectReportAttachmentS3KeySQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and attachmentId provided', () => {
    const response = getProjectReportAttachmentS3KeySQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('updateProjectReportAttachmentMetadataSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = updateProjectReportAttachmentMetadataSQL(
      (null as unknown) as number,
      1,
      put_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = updateProjectReportAttachmentMetadataSQL(
      1,
      (null as unknown) as number,
      put_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns null response when null metadata provided', () => {
    const response = updateProjectReportAttachmentMetadataSQL(1, 1, (null as unknown) as PutReportAttachmentMetadata);

    expect(response).to.be.null;
  });

  it('returns not null response when valid parameters are provided', () => {
    const response = updateProjectReportAttachmentMetadataSQL(1, 1, put_sample_attachment_meta);

    expect(response).to.not.be.null;
  });
});
