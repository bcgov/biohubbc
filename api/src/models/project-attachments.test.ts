import { expect } from 'chai';
import { describe } from 'mocha';
import { GetProjectAttachmentsData } from './project-attachments';

describe('GetProjectAttachmentsData', () => {
  describe('No values provided', () => {
    let getAttachmentsData: GetProjectAttachmentsData;

    before(() => {
      getAttachmentsData = new GetProjectAttachmentsData(null);
    });

    it('sets attachmentsList', function () {
      expect(getAttachmentsData.attachmentsList).to.eql([]);
    });
  });

  describe('All values provided with only create date', () => {
    let getAttachmentsData: GetProjectAttachmentsData;

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
      getAttachmentsData = new GetProjectAttachmentsData(attachmentsData);
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
