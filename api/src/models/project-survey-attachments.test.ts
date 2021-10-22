import { expect } from 'chai';
import { describe } from 'mocha';
import { GetAttachmentsData } from './project-survey-attachments';

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
        security_token: 'token123',
        revision_count: 0
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
          securityToken: 'token123',
          revision_count: 0
        }
      ]);
    });
  });
});
