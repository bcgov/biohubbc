import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetAttachmentsData,
  GetReportAttachmentAuthor,
  GetReportAttachmentMetadata,
  PostReportAttachmentMetadata,
  PutReportAttachmentMetadata
} from './project-survey-attachments';

describe('GetAttachmentsData', () => {
  it('No values provided', async () => {
    const getAttachmentsData = await GetAttachmentsData.buildAttachmentsData([], () => {
      return 1;
    });
    console.log('getAttachmentsData', getAttachmentsData);
    expect(getAttachmentsData).to.eql([]);
  });

  it('All values provided with only create date', async () => {
    const attachmentsData = [
      {
        survey_report_attachment_id: 1,
        file_name: 'filename',
        create_date: '2020-04-04',
        file_size: 24,
        file_type: 'Video'
      }
    ];

    const getAttachmentsData = await GetAttachmentsData.buildAttachmentsData(attachmentsData, () => {
      return 1;
    });

    expect(getAttachmentsData).to.be.an('array');
    expect(getAttachmentsData).to.have.length(1);

    expect(getAttachmentsData[0].fileName).to.equal('filename');
    expect(getAttachmentsData[0].fileType).to.equal('Video');
    expect(getAttachmentsData[0].id).to.equal(1);
    expect(getAttachmentsData[0].lastModified).to.match(new RegExp('2020-04-04T.*'));
    expect(getAttachmentsData[0].size).to.equal(24);
  });
});

describe('PostReportAttachmentsMetaData', () => {
  describe('No values provided', () => {
    let postReportAttachmentsData: PostReportAttachmentMetadata;

    before(() => {
      postReportAttachmentsData = new PostReportAttachmentMetadata(null);
    });

    it('sets attachmentsData', () => {
      expect(postReportAttachmentsData).to.eql({ title: null, year_published: 0, authors: [], description: null });
    });
  });

  describe('All values provided', () => {
    let postReportAttachmentsData: PostReportAttachmentMetadata;

    const input = {
      title: 'Report 1',
      year_published: 2000,
      authors: [{ first_name: 'John', last_name: 'Smith' }],
      description: 'abstract of the report'
    };

    before(() => {
      postReportAttachmentsData = new PostReportAttachmentMetadata(input);
    });

    it('sets the report metadata', () => {
      expect(postReportAttachmentsData).to.eql({
        title: 'Report 1',
        year_published: 2000,
        authors: [{ first_name: 'John', last_name: 'Smith' }],
        description: 'abstract of the report'
      });
    });
  });
});

describe('PutReportAttachmentMetaData', () => {
  describe('No values provided', () => {
    it('sets attachmentsData', () => {
      const putReportAttachmentData = new PutReportAttachmentMetadata(null);

      expect(putReportAttachmentData.title).to.equal(null);
      expect(putReportAttachmentData.year_published).to.equal(0);
      expect(putReportAttachmentData.authors).to.eql([]);
      expect(putReportAttachmentData.description).to.equal(null);
      expect(putReportAttachmentData.revision_count).to.equal(0);
    });
  });

  describe('All values provided', () => {
    const input = {
      title: 'Report 1',
      year_published: 2000,
      authors: [{ first_name: 'John', last_name: 'Smith' }],
      description: 'abstract of the report',
      revision_count: 1
    };

    it('sets the report metadata', () => {
      const putReportAttachmentData = new PutReportAttachmentMetadata(input);
      expect(putReportAttachmentData.title).to.equal(input.title);
      expect(putReportAttachmentData.year_published).to.equal(input.year_published);
      expect(putReportAttachmentData.authors).to.eql(input.authors);
      expect(putReportAttachmentData.description).to.equal(input.description);
      expect(putReportAttachmentData.revision_count).to.equal(input.revision_count);
    });
  });
});

describe('GetReportAttachmentMetaData', () => {
  describe('No values provided', () => {
    it('sets the report metadata', () => {
      const getReportAttachmentData = new GetReportAttachmentMetadata(null);

      expect(getReportAttachmentData).to.eql({
        attachment_id: null,
        title: null,
        year_published: 0,
        authors: [],
        description: null,
        last_modified: null,
        revision_count: null
      });
    });
  });

  describe('All values provided', () => {
    const input = {
      attachment_id: 1,
      title: 'My Report',
      update_date: '2020-10-10',
      description: 'abstract of the report',
      year_published: 2020,
      revision_count: 2,
      authors: [{ first_name: 'John', last_name: 'Smith' }]
    };

    it('sets the report metadata', () => {
      const getReportAttachmentData = new GetReportAttachmentMetadata(input);

      expect(getReportAttachmentData.title).to.equal(input.title);
      expect(getReportAttachmentData.year_published).to.equal(input.year_published);
      expect(getReportAttachmentData.description).to.equal(input.description);
      expect(getReportAttachmentData.last_modified).to.equal(input.update_date);
      expect(getReportAttachmentData.revision_count).to.equal(input.revision_count);
    });
  });
});

describe('GetReportAttachmentAuthor', () => {
  describe('No values provided', () => {
    it('sets the authors', () => {
      const getReportAttachmentAuthor = new GetReportAttachmentAuthor(null);
      expect(getReportAttachmentAuthor).to.eql({
        first_name: null,
        last_name: null
      });
    });
  });

  describe('All values provided', () => {
    const input = {
      first_name: 'John',
      last_name: 'Smith'
    };

    it('sets the report metadata', () => {
      const getReportAttachmentAuthor = new GetReportAttachmentAuthor(input);

      expect(getReportAttachmentAuthor.first_name).to.equal(input.first_name);
      expect(getReportAttachmentAuthor.last_name).to.equal(input.last_name);
    });
  });
});
