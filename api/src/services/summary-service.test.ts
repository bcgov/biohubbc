import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx from 'xlsx';
import { SUBMISSION_STATUS_TYPE, SUMMARY_SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { SummaryRepository } from '../repositories/summary-repository';
import * as FileUtils from '../utils/file-utils';
// import { ITemplateMethodologyData } from '../repositories/validation-repository';
// import * as FileUtils from '../utils/file-utils';
import { ICsvState } from '../utils/media/csv/csv-file';

// import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import {  IMediaState, MediaFile } from '../utils/media/media-file';
/*
import * as MediaUtils from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { TransformationSchemaParser } from '../utils/media/xlsx/transformation/transformation-schema-parser';
import { XLSXTransformation } from '../utils/media/xlsx/transformation/xlsx-transformation';
*/
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { MessageError, SubmissionError, SummarySubmissionError, SummarySubmissionErrorFromMessageType } from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';

import { SummaryService } from './summary-service';

chai.use(sinonChai);

// const mockS3File = {
//   fieldname: 'media',
//   originalname: 'test.csv',
//   encoding: '7bit',
//   mimetype: 'text/csv',
//   size: 340
// };

// const s3Archive = {
//   fieldname: 'media',
//   originalname: 'test.zip',
//   encoding: '7bit',
//   mimetype: 'application/zip',
//   size: 340
// };

const mockService = () => {
  const dbConnection = getMockDBConnection();
  return new SummaryService(dbConnection);
};

/*
const mockOccurrenceSubmission = {
  occurrence_submission_id: 1,
  survey_id: 1,
  template_methodology_species_id: 1,
  source: '',
  input_key: 'input key',
  input_file_name: '',
  output_key: 'output key',
  output_file_name: ''
};
*/

const buildFile = (fileName: string, customProps: { template_id?: number; csm_id?: number }) => {
  const newWorkbook = xlsx.utils.book_new();
  newWorkbook.Custprops = {};

  if (customProps.csm_id && customProps.template_id) {
    newWorkbook.Custprops['sims_template_id'] = customProps.template_id;
    newWorkbook.Custprops['sims_csm_id'] = customProps.csm_id;
  }

  const ws_name = 'SheetJS';

  // make worksheet
  const ws_data = [
    ['S', 'h', 'e', 'e', 't', 'J', 'S'],
    [1, 2, 3, 4, 5]
  ];
  const ws = xlsx.utils.aoa_to_sheet(ws_data);

  // Add the worksheet to the workbook
  xlsx.utils.book_append_sheet(newWorkbook, ws, ws_name);

  const buffer = xlsx.write(newWorkbook, { type: 'buffer' });

  return new MediaFile(fileName, 'text/csv', buffer);
};

describe.only('SummaryService', () => {
  afterEach(() => {
    sinon.restore();
  });

  // Part A

  describe('validateFile', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without issue', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };
      const prep = sinon.stub(service, 'summaryTemplatePreparation').resolves(mockPrep);
      const validation = sinon.stub(service, 'summaryTemplateValidation').resolves();

      await service.validateFile(1, 1);
      expect(prep).to.be.calledOnce;
      expect(validation).to.be.calledOnce;
    });

    it('should insert submission error', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };
      const mockError = SummarySubmissionErrorFromMessageType(SUMMARY_SUBMISSION_MESSAGE_TYPE.MISSING_VALIDATION_SCHEMA)
      const prep = sinon.stub(service, 'summaryTemplatePreparation').resolves(mockPrep);
      sinon.stub(service.summaryRepository, 'insertSummarySubmissionMessage').resolves();
      const validation = sinon
        .stub(service, 'summaryTemplateValidation')
        .throws(mockError);
      
      try {
        await service.validateFile(1, 1);
        expect(prep).to.be.calledOnce;
      } catch (error) {
        expect(error).to.be.instanceOf(SummarySubmissionError);
        expect(validation).not.to.be.calledOnce;
      }
    });

    it('should throw', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };
      const prep = sinon.stub(service, 'summaryTemplatePreparation').resolves(mockPrep);
      const validation = sinon.stub(service, 'summaryTemplateValidation').throws(new Error());
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      try {
        await service.validateFile(1, 1);
        expect(prep).to.be.calledOnce;
        expect(validation).to.be.calledOnce;
      } catch (error) {
        expect(error).not.to.be.instanceOf(SubmissionError);
        expect(insertError).not.to.be.calledOnce;
        expect(submissionStatus).not.to.be.calledOnce;
      }
    }); 
  });

  describe('updateSurveySummarySubmissionWithKey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should update a survey summary submission key', async () => {
      const service = mockService();
      const update = sinon.stub(service, 'updateSurveySummarySubmissionWithKey').resolves({ survey_summary_submission_id: 12 })
      const result = await service.updateSurveySummarySubmissionWithKey(12, 'new-test-key')

      expect(update).to.be.calledOnce;
      expect(result).to.be.eql({ survey_summary_submission_id: 12 });
    })
  });

  describe('insertSurveySummarySubmission', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
  describe('deleteSummarySubmission', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
  describe('getSummarySubmissionMessages', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
  describe('findSummarySubmissionById', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
  describe('getLatestSurveySummarySubmission', () => {
    afterEach(() => {
      sinon.restore();
    });

  });

  describe('summaryTemplatePreparation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid S3 key and xlsx object', async () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const s3Key = 's3 key';
      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);
      sinon.stub(SummaryService.prototype, 'prepXLSX').returns(new XLSXCSV(file));

      const service = mockService();
      const results = await service.summaryTemplatePreparation(1);

      expect(results.xlsx).to.not.be.empty;
      expect(results.xlsx).to.be.instanceOf(XLSXCSV);
      expect(results.s3InputKey).to.be.eql(s3Key);
    });

    it('throws Failed to prepare submission error', async () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      sinon.stub(FileUtils, 'getFileFromS3').throws(new SubmissionError({}));
      sinon.stub(SummaryService.prototype, 'prepXLSX').resolves(new XLSXCSV(file));

      try {
        const dbConnection = getMockDBConnection();
        const service = new SummaryService(dbConnection);
        await service.summaryTemplatePreparation(1);

        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
        if (error instanceof SubmissionError) {
          expect(error.status).to.be.eql(SUBMISSION_STATUS_TYPE.FAILED_SUMMARY_PREPARATION);
        }
      }
    });
  });

  describe('summaryTemplateValidation', () => {
    afterEach(() => {
      sinon.restore();
    });

  });


  // Part B

  describe('prepXLSX', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
  describe('getSummaryTemplateSpeciesRecords', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
  describe('getValidationRules', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
  describe('validateXLSX', () => {
    afterEach(() => {
      sinon.restore();
    });

  });

  describe('persistSummaryValidationResults', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without issue', async () => {
      it('should return false if no errors are present', async () => {
        const service = mockService();
        const csvState: ICsvState[] = [];
        const mediaState: IMediaState = {
          fileName: 'Test.xlsx',
          isValid: true
        };
        const response = await service.persistSummaryValidationResults(csvState, mediaState);
        // no errors found, data is valid
        expect(response).to.be.false;
      });
    });

  });

  describe('insertSummarySubmissionError', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without issue', async () => {
      const connection = getMockDBConnection();
      const mockService = new SummaryService(connection);
      const mockInsert = sinon.stub(SummaryRepository.prototype, 'insertSummarySubmissionMessage').resolves();
      const error = new SummarySubmissionError({messages: [new MessageError(SUMMARY_SUBMISSION_MESSAGE_TYPE.MISSING_RECOMMENDED_HEADER)]})
      await mockService.insertSummarySubmissionError(1, error);

      expect(mockInsert).to.be.called;
    });
  });
});
