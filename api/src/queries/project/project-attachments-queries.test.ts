import { expect } from 'chai';
import { describe } from 'mocha';
import { PutReportAttachmentMetadata, IReportAttachmentAuthor } from '../../models/project-attachments';
import {
  getProjectAttachmentsSQL,
  deleteProjectAttachmentSQL,
  getProjectAttachmentS3KeySQL,
  getProjectReportAttachmentS3KeySQL,
  postProjectAttachmentSQL,
  getProjectAttachmentByFileNameSQL,
  getProjectReportAttachmentByFileNameSQL,
  putProjectAttachmentSQL,
  postProjectReportAttachmentSQL,
  getProjectReportAttachmentsSQL,
  putProjectReportAttachmentSQL,
  deleteProjectReportAttachmentSQL,
  updateProjectReportAttachmentMetadataSQL,
  insertProjectReportAttachmentAuthorSQL,
  deleteProjectReportAttachmentAuthorsSQL,
  getProjectReportAttachmentSQL,
  getProjectReportAuthorsSQL
} from './project-attachments-queries';

const post_sample_attachment_meta = {
  title: 'title',
  year_published: '2000',
  authors: [
    {
      first_name: 'John',
      last_name: 'Smith'
    }
  ],
  description: 'description'
};

const put_sample_attachment_meta = {
  title: 'title',
  year_published: '2000',
  authors: [
    {
      first_name: 'John',
      last_name: 'Smith'
    }
  ],
  description: 'description',
  revision_count: 0
};

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

describe('getProjectReportAttachmentsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectReportAttachmentsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getProjectReportAttachmentsSQL(1);

    expect(response).to.not.be.null;
  });
});

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

describe('postProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = postProjectAttachmentSQL('name', 20, 'type', (null as unknown) as number, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = postProjectAttachmentSQL((null as unknown) as string, 20, 'type', 1, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null fileSize provided', () => {
    const response = postProjectAttachmentSQL('name', (null as unknown) as number, 'type', 1, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = postProjectAttachmentSQL('name', 2, 'type', 1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns null response when null fileType provided', () => {
    const response = postProjectAttachmentSQL('name', 2, (null as unknown) as string, 1, 'key');

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName and fileSize and key and fileType provided', () => {
    const response = postProjectAttachmentSQL('name', 20, 'type', 1, 'key');

    expect(response).to.not.be.null;
  });
});

describe('postProjectReportAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = postProjectReportAttachmentSQL(
      'name',
      20,
      (null as unknown) as number,
      'key',
      post_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = postProjectReportAttachmentSQL(
      (null as unknown) as string,
      20,
      1,
      'key',
      post_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns null response when null fileSize provided', () => {
    const response = postProjectReportAttachmentSQL(
      'name',
      (null as unknown) as number,
      1,
      'key',
      post_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = postProjectReportAttachmentSQL(
      'name',
      2,
      1,
      (null as unknown) as string,
      post_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName and fileSize and key provided', () => {
    const response = postProjectReportAttachmentSQL('name', 20, 1, 'key', post_sample_attachment_meta);

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
describe('getProjectReportAttachmentByFileNameSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectReportAttachmentByFileNameSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = getProjectReportAttachmentByFileNameSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName provided', () => {
    const response = getProjectReportAttachmentByFileNameSQL(1, 'name');

    expect(response).to.not.be.null;
  });
});

describe('putProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = putProjectAttachmentSQL((null as unknown) as number, 'name', 'type');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = putProjectAttachmentSQL(1, (null as unknown) as string, 'type');

    expect(response).to.be.null;
  });

  it('returns null response when null fileType provided', () => {
    const response = putProjectAttachmentSQL(1, 'name', (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName and fileType provided', () => {
    const response = putProjectAttachmentSQL(1, 'name', 'type');

    expect(response).to.not.be.null;
  });
});

describe('putProjectReportAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = putProjectReportAttachmentSQL((null as unknown) as number, 'name', put_sample_attachment_meta);

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = putProjectReportAttachmentSQL(1, (null as unknown) as string, put_sample_attachment_meta);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName provided', () => {
    const response = putProjectReportAttachmentSQL(1, 'name', put_sample_attachment_meta);

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

describe('insertProjectReportAttachmentAuthorSQL', () => {
  const report_attachment_author: IReportAttachmentAuthor = {
    first_name: 'John',
    last_name: 'Smith'
  };
  it('returns null response when null attachmentId provided', () => {
    const response = insertProjectReportAttachmentAuthorSQL((null as unknown) as number, report_attachment_author);

    expect(response).to.be.null;
  });

  it('returns null response when null report author provided', () => {
    const response = insertProjectReportAttachmentAuthorSQL(1, (null as unknown) as IReportAttachmentAuthor);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmmentId and null report author are provided', () => {
    const response = insertProjectReportAttachmentAuthorSQL(
      (null as unknown) as number,
      (null as unknown) as IReportAttachmentAuthor
    );
    expect(response).to.be.null;
  });

  it('returns not null response when valid parameters are provided', () => {
    const response = insertProjectReportAttachmentAuthorSQL(1, report_attachment_author);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectReportAttachmentAuthorsSQL', () => {
  it('returns null response when null attachmentId provided', () => {
    const response = deleteProjectReportAttachmentAuthorsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns not null response when valid params are provided', () => {
    const response = deleteProjectReportAttachmentAuthorsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getProjectReportAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectReportAttachmentSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = getProjectReportAttachmentSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and attachmentId provided', () => {
    const response = getProjectReportAttachmentSQL(1, 2);

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
