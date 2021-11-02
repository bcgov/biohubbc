import { expect } from 'chai';
import { describe } from 'mocha';
import { PutReportAttachmentMetadata, IReportAttachmentAuthor } from '../../models/project-survey-attachments';
import {
  getSurveyAttachmentsSQL,
  deleteSurveyAttachmentSQL,
  getSurveyAttachmentS3KeySQL,
  postSurveyAttachmentSQL,
  getSurveyAttachmentByFileNameSQL,
  getSurveyReportAttachmentByFileNameSQL,
  putSurveyAttachmentSQL,
  getSurveyReportAttachmentsSQL,
  deleteSurveyReportAttachmentSQL,
  postSurveyReportAttachmentSQL,
  putSurveyReportAttachmentSQL,
  updateSurveyReportAttachmentMetadataSQL,
  insertSurveyReportAttachmentAuthorSQL,
  deleteSurveyReportAttachmentAuthorsSQL,
  getSurveyReportAuthorsSQL
} from './survey-attachments-queries';

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
  it('returns null response when null attachmentId provided', () => {
    const response = deleteSurveyAttachmentSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid attachmentId provided', () => {
    const response = deleteSurveyAttachmentSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('putSurveyReportAttachmentSQL', () => {
  it('returns null response when null fileName provided', () => {
    const response = putSurveyReportAttachmentSQL(1, (null as unknown) as string, put_sample_attachment_meta);

    expect(response).to.be.null;
  });

  it('returns null response when null surveyId provided', () => {
    const response = putSurveyReportAttachmentSQL((null as unknown) as number, 'name', put_sample_attachment_meta);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = putSurveyReportAttachmentSQL(1, 'name', put_sample_attachment_meta);

    expect(response).to.not.be.null;
  });
});

describe('updateSurveyReportAttachmentMetadataSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = updateSurveyReportAttachmentMetadataSQL(
      (null as unknown) as number,
      1,
      put_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = updateSurveyReportAttachmentMetadataSQL(
      1,
      (null as unknown) as number,
      put_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns null response when null metadata provided', () => {
    const response = updateSurveyReportAttachmentMetadataSQL(1, 1, (null as unknown) as PutReportAttachmentMetadata);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = updateSurveyReportAttachmentMetadataSQL(1, 2, put_sample_attachment_meta);

    expect(response).to.not.be.null;
  });
});

describe('postSurveyReportAttachmentSQL', () => {
  it('returns null response when null fileName provided', () => {
    const response = postSurveyReportAttachmentSQL(
      (null as unknown) as string,
      30,
      1,
      'key',
      post_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns null response when null fileSize provided', () => {
    const response = postSurveyReportAttachmentSQL(
      'name',
      (null as unknown) as number,
      1,
      'key',
      post_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns null response when null projectId provided', () => {
    const response = postSurveyReportAttachmentSQL(
      'name',
      30,
      (null as unknown) as number,
      'key',
      post_sample_attachment_meta
    );

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = postSurveyReportAttachmentSQL('name', 30, 1, 'key', post_sample_attachment_meta);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyReportAttachmentSQL', () => {
  it('returns null response when null attachmentId provided', () => {
    const response = deleteSurveyReportAttachmentSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid attachmentId provided', () => {
    const response = deleteSurveyReportAttachmentSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyReportAttachmentsSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getSurveyReportAttachmentsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId provided', () => {
    const response = getSurveyReportAttachmentsSQL(1);

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

describe('getSurveyReportAttachmentByFileNameSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getSurveyReportAttachmentByFileNameSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = getSurveyReportAttachmentByFileNameSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId and fileName provided', () => {
    const response = getSurveyReportAttachmentByFileNameSQL(1, 'name');

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

describe('insertSurveyReportAttachmentAuthorSQL', () => {
  const report_attachment_author: IReportAttachmentAuthor = {
    first_name: 'John',
    last_name: 'Smith'
  };
  it('returns null response when null attachmentId provided', () => {
    const response = insertSurveyReportAttachmentAuthorSQL((null as unknown) as number, report_attachment_author);

    expect(response).to.be.null;
  });

  it('returns null response when null report author provided', () => {
    const response = insertSurveyReportAttachmentAuthorSQL(1, (null as unknown) as IReportAttachmentAuthor);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmmentId and null report author are provided', () => {
    const response = insertSurveyReportAttachmentAuthorSQL(
      (null as unknown) as number,
      (null as unknown) as IReportAttachmentAuthor
    );
    expect(response).to.be.null;
  });

  it('returns not null response when valid parameters are provided', () => {
    const response = insertSurveyReportAttachmentAuthorSQL(1, report_attachment_author);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyReportAttachmentAuthorsSQL', () => {
  it('returns null response when null attachmentId provided', () => {
    const response = deleteSurveyReportAttachmentAuthorsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns not null response when valid params are provided', () => {
    const response = deleteSurveyReportAttachmentAuthorsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyReportAuthorSQL', () => {
  it('returns null response when null projectReportAttachmentId provided', () => {
    const response = getSurveyReportAuthorsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectReportAttachmentId provided', () => {
    const response = getSurveyReportAuthorsSQL(1);

    expect(response).to.not.be.null;
  });
});
