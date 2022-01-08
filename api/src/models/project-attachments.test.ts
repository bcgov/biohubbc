import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetAttachmentsData,
  PostReportAttachmentMetadata,
  PutReportAttachmentMetadata,
  GetReportAttachmentMetadata,
  GetReportAttachmentAuthor
} from './project-attachments';

describe('GetAttachmentsData', () => {
  describe('No values provided', () => {
    let getAttachmentsData: GetAttachmentsData;

    before(() => {
      getAttachmentsData = new GetAttachmentsData(null);
    });

    it('sets attachmentsList', function () {
      expect(getAttachmentsData.attachmentsList).to.eql([]);
    });
  });

  describe('All values provided with only create date', () => {
    let getAttachmentsData: GetAttachmentsData;

    const attachmentsData = [
      {
        id: 1,
        file_name: 'filename',
        create_date: '2020/04/04',
        file_size: 24,
        file_type: 'Video',
        security_token: 'token123'
      }
    ];

    before(() => {
      getAttachmentsData = new GetAttachmentsData(attachmentsData);
    });

    it('sets attachmentsList', function () {
      expect(getAttachmentsData.attachmentsList).to.eql([
        {
          id: 1,
          fileName: 'filename',
          lastModified: '2020/04/04',
          size: 24,
          fileType: 'Video',
          securityToken: 'token123'
        }
      ]);
    });
  });
});

describe('PostReportAttachmentsMetaData', () => {
  describe('No values provided', () => {
    let postReportAttachmentsData: PostReportAttachmentMetadata;

    before(() => {
      postReportAttachmentsData = new PostReportAttachmentMetadata(null);
    });

    it('sets attachmentsData', function () {
      expect(postReportAttachmentsData).to.eql({ title: null, year_published: null, authors: [], description: null });
    });
  });

  describe('All values provided', () => {
    let postReportAttachmentsData: PostReportAttachmentMetadata;

    const input = {
      title: 'Report 1',
      year_published: '2000',
      authors: [{ first_name: 'John', last_name: 'Smith' }],
      description: 'abstract of the report'
    };

    before(() => {
      postReportAttachmentsData = new PostReportAttachmentMetadata(input);
    });

    it('sets the report metadata', function () {
      expect(postReportAttachmentsData).to.eql({
        title: 'Report 1',
        year_published: '2000',
        authors: [{ first_name: 'John', last_name: 'Smith' }],
        description: 'abstract of the report'
      });
    });
  });
});

describe('PutReportAttachmentMetaData', () => {
  describe('No values provided', () => {
    it('sets attachmentsData', function () {
      const putReportAttachmentData = new PutReportAttachmentMetadata(null);

      expect(putReportAttachmentData.title).to.equal(null);
      expect(putReportAttachmentData.year_published).to.equal(null);
      expect(putReportAttachmentData.authors).to.eql([]);
      expect(putReportAttachmentData.description).to.equal(null);
      expect(putReportAttachmentData.revision_count).to.equal(null);
    });
  });

  describe('All values provided', () => {
    const input = {
      title: 'Report 1',
      year_published: '2000',
      authors: [{ first_name: 'John', last_name: 'Smith' }],
      description: 'abstract of the report',
      revision_count: 1
    };

    it('sets the report metadata', function () {
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
    it('sets the report metadata', function () {
      const getReportAttachmentData = new GetReportAttachmentMetadata(null);

      expect(getReportAttachmentData).to.eql({
        attachment_id: null,
        title: null,
        year_published: null,
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
      year: '2020',
      revision_count: 2,
      authors: [{ first_name: 'John', last_name: 'Smith' }]
    };

    it('sets the report metadata', function () {
      const getReportAttachmentData = new GetReportAttachmentMetadata(input);

      expect(getReportAttachmentData.title).to.equal(input.title);
      expect(getReportAttachmentData.year_published).to.equal(input.year);
      expect(getReportAttachmentData.description).to.equal(input.description);
      expect(getReportAttachmentData.last_modified).to.equal(input.update_date);
      expect(getReportAttachmentData.revision_count).to.equal(input.revision_count);
    });
  });
});

describe('GetReportAttachmentAuthor', () => {
  describe('No values provided', () => {
    it('sets the authors', function () {
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

    it('sets the report metadata', function () {
      const getReportAttachmentAuthor = new GetReportAttachmentAuthor(input);

      expect(getReportAttachmentAuthor.first_name).to.equal(input.first_name);
      expect(getReportAttachmentAuthor.last_name).to.equal(input.last_name);
    });
  });
});
