import { expect } from 'chai';
import { describe } from 'mocha';
import { GetSurveyAttachmentsData } from './survey-attachments';

describe('GetSurveyAttachmentsData', () => {
  describe('No values provided', () => {
    let getAttachmentsData: GetSurveyAttachmentsData;

    before(() => {
      getAttachmentsData = new GetSurveyAttachmentsData(null);
    });

    it('sets attachmentsList', function () {
      expect(getAttachmentsData.attachmentsList).to.eql([]);
    });
  });

  describe('All values provided with only create date', () => {
    let getAttachmentsData: GetSurveyAttachmentsData;

    const attachmentsData = [
      {
        id: 1,
        file_name: 'filename',
        create_date: '2020/04/04',
        file_size: 24
      }
    ];

    before(() => {
      getAttachmentsData = new GetSurveyAttachmentsData(attachmentsData);
    });

    it('sets attachmentsList', function () {
      expect(getAttachmentsData.attachmentsList).to.eql([
        {
          id: 1,
          fileName: 'filename',
          lastModified: '2020/04/04',
          size: 24
        }
      ]);
    });
  });
});
