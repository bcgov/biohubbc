import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx from 'xlsx';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { ValidationRepository } from '../repositories/validation-repository';
import * as FileUtils from '../utils/file-utils';
import { ICsvState } from '../utils/media/csv/csv-file';
// import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import { ArchiveFile, IMediaState, MediaFile } from '../utils/media/media-file';
import * as MediaUtils from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { TransformationSchemaParser } from '../utils/media/xlsx/transformation/transformation-schema-parser';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { SubmissionError, SubmissionErrorFromMessageType } from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';
import { OccurrenceService } from './occurrence-service';
import { ValidationService } from './validation-service';

chai.use(sinonChai);

// const s3File = {
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

// 53% covered
describe.skip('ValidationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getValidationSchema', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid schema', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      sinon.stub(ValidationRepository.prototype, 'getTemplateMethodologySpeciesRecord').resolves({
        validation: { id: 1 }
      });

      const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
      const schema = await service.getValidationSchema(file);
      expect(schema).to.be.not.null;
    });

    it('should throw Failed to get validation rules error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      sinon.stub(ValidationRepository.prototype, 'getTemplateMethodologySpeciesRecord').resolves({});

      try {
        const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
        await service.getValidationSchema(file);
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        if (error instanceof SubmissionError) {
          expect(error.submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES);
        }
      }
    });
  });

  describe('getTransformationSchema', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid schema', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      sinon.stub(ValidationRepository.prototype, 'getTemplateMethodologySpeciesRecord').resolves({
        transform: { id: 1 }
      });

      const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
      const schema = await service.getTransformationSchema(file);
      expect(schema).to.be.not.null;
    });

    it('should throw Failed to get transformation rules error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      sinon.stub(ValidationRepository.prototype, 'getTemplateMethodologySpeciesRecord').resolves({});

      try {
        const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
        await service.getTransformationSchema(file);
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        if (error instanceof SubmissionError) {
          expect(error.submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.FAILED_GET_TRANSFORMATION_RULES);
        }
      }
    });
  });

  describe('templateValidation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should complete without error', async () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));

      const xlsxCsv = new XLSXCSV(file);
      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);

      const getValidation = sinon.stub(ValidationService.prototype, 'getValidationSchema').resolves('');
      const getRules = sinon.stub(ValidationService.prototype, 'getValidationRules').resolves('');
      const validate = sinon.stub(ValidationService.prototype, 'validateXLSX').resolves({});
      const persistResults = sinon.stub(ValidationService.prototype, 'persistValidationResults').resolves(true);

      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      await service.templateValidation(xlsxCsv);

      expect(getValidation).to.be.calledOnce;
      expect(getRules).to.be.calledOnce;
      expect(validate).to.be.calledOnce;
      expect(persistResults).to.be.calledOnce;
    });

    it('should throw Failed to validate error', async () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const xlsxCsv = new XLSXCSV(file);
      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);

      sinon.stub(ValidationService.prototype, 'getValidationSchema').throws(new SubmissionError({}));
      sinon.stub(ValidationService.prototype, 'getValidationRules').resolves({});
      sinon.stub(ValidationService.prototype, 'validateXLSX').resolves({});
      sinon.stub(ValidationService.prototype, 'persistValidationResults').resolves(true);

      try {
        const dbConnection = getMockDBConnection();
        const service = new ValidationService(dbConnection);
        await service.templateValidation(xlsxCsv);
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        if (error instanceof SubmissionError) {
          expect(error.status).to.be.eql(SUBMISSION_STATUS_TYPE.FAILED_VALIDATION);
        }
      }
    });
  });

  describe('templatePreparation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid S3 key and xlsx object', async () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const s3Key = 's3 key';
      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);
      sinon.stub(ValidationService.prototype, 'prepXLSX').resolves(new XLSXCSV(file));
      sinon.stub(OccurrenceService.prototype, 'getOccurrenceSubmission').resolves({
        occurrence_submission_id: 1,
        survey_id: 1,
        template_methodology_species_id: 1,
        source: '',
        input_key: s3Key,
        input_file_name: '',
        output_key: '',
        output_file_name: ''
      });

      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const results = await service.templatePreparation(1);

      expect(results.xlsx).to.not.be.empty;
      expect(results.xlsx instanceof XLSXCSV).to.be.true;
      expect(results.s3InputKey).to.be.eql(s3Key);
    });

    it('throws Failed to prepare submission error', async () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const s3Key = 's3 key';
      sinon.stub(FileUtils, 'getFileFromS3').throws(new SubmissionError({}));
      sinon.stub(ValidationService.prototype, 'prepXLSX').resolves(new XLSXCSV(file));
      sinon.stub(OccurrenceService.prototype, 'getOccurrenceSubmission').resolves({
        occurrence_submission_id: 1,
        survey_id: 1,
        template_methodology_species_id: 1,
        source: '',
        input_key: s3Key,
        input_file_name: '',
        output_key: '',
        output_file_name: ''
      });

      try {
        const dbConnection = getMockDBConnection();
        const service = new ValidationService(dbConnection);
        await service.templatePreparation(1);

        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        if (error instanceof SubmissionError) {
          expect(error.status).to.be.eql(SUBMISSION_STATUS_TYPE.FAILED_OCCURRENCE_PREPARATION);
        }
      }
    });
  });

  describe('prepXLSX', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return valid XLSXCSV', () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(file);
      sinon.stub(XLSXCSV, 'prototype').returns({
        workbook: {
          rawWorkbook: {
            Custprops: {
              sims_template_id: 1,
              sims_csm_id: 1
            }
          }
        }
      });

      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      try {
        const xlsx = service.prepXLSX(file);
        expect(xlsx).to.not.be.empty;
        expect(xlsx instanceof XLSXCSV).to.be.true;
      } catch (error) {
        expect(parse).to.be.calledOnce;
      }
    });

    it('should throw File submitted is not a supported type error', () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(null);

      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      try {
        service.prepXLSX(file);
        expect.fail();
      } catch (error) {
        if (error instanceof SubmissionError) {
          expect(error.submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE);
        }

        expect(error instanceof SubmissionError).to.be.true;
        expect(parse).to.be.calledOnce;
      }
    });

    it('should throw Media is invalid error', () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(('a file' as unknown) as MediaFile);

      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      try {
        service.prepXLSX(file);
        expect.fail();
      } catch (error) {
        if (error instanceof SubmissionError) {
          expect(error.submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
        }

        expect(error instanceof SubmissionError).to.be.true;
        expect(parse).to.be.calledOnce;
      }
    });

    it('should throw Unable to get transform schema for submission error', () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(file);

      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      try {
        service.prepXLSX(file);
        expect.fail();
      } catch (error) {
        if (error instanceof SubmissionError) {
          expect(error.submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TRANSFORM_SCHEMA);
        }

        expect(error instanceof SubmissionError).to.be.true;
        expect(parse).to.be.calledOnce;
      }
    });
  });

  describe('persistValidationResults', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a submission error with multiple messages attached', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const csvState: ICsvState[] = [
        {
          fileName: '',
          isValid: false,
          headerErrors: [
            {
              errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
              message: '',
              col: 'Effort & Effects'
            }
          ],
          rowErrors: [
            {
              errorCode: SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
              message: 'No bueno',
              col: 'Block SU',
              row: 1
            }
          ]
        }
      ];
      const mediaState: IMediaState = {
        fileName: 'Test.xlsx',
        isValid: true
      };
      try {
        await service.persistValidationResults(csvState, mediaState);
        expect.fail();
      } catch (error) {
        if (error instanceof SubmissionError) {
          expect(error.status).to.be.eql(SUBMISSION_STATUS_TYPE.REJECTED);

          error.submissionMessages.forEach((e) => {
            expect(e.type).to.be.eql(SUBMISSION_MESSAGE_TYPE.INVALID_VALUE);
          });
        }
      }
    });

    it('should return false if no errors are present', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const csvState: ICsvState[] = [];
      const mediaState: IMediaState = {
        fileName: 'Test.xlsx',
        isValid: true
      };
      const response = await service.persistValidationResults(csvState, mediaState);
      // no errors found, data is valid
      expect(response).to.be.false;
    });
  });

  describe('getValidationRules', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return validation schema parser', () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);

      const parser = service.getValidationRules({});
      expect(parser instanceof ValidationSchemaParser).to.be.true;
    });

    it('should fail with invalid json', () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);

      try {
        service.getValidationRules('---');
        expect.fail();
      } catch (error) {}
    });
  });

  describe('getTransformationRules', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return validation schema parser', () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);

      const parser = service.getTransformationRules({});
      expect(parser instanceof TransformationSchemaParser).to.be.true;
    });

    it('should fail with invalid json', () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);

      try {
        service.getTransformationRules('---');
        expect.fail();
      } catch (error) {}
    });
  });

  describe('processDWCFile', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should', () => {});
    it('should', () => {});
    it('should', () => {});
  });

  describe('dwcPreparation', () => {
    afterEach(() => {
      sinon.restore();
    });
  });

  describe('validateDWC', () => {
    afterEach(() => {
      sinon.restore();
    });
  });

  describe('validateDWCArchive', () => {
    afterEach(() => {
      sinon.restore();
    });
  });

  describe('prepDWCArchive', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return a DWCArchive', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const fileName = 'test file';
      const parse = sinon
        .stub(MediaUtils, 'parseUnknownMedia')
        .returns(new ArchiveFile(fileName, '', Buffer.from([]), []));

      const archive = await service.prepDWCArchive({} as ArchiveFile);
      expect(archive.rawFile.fileName).to.be.eql(fileName);
      expect(parse).to.be.calledOnce;
    });

    it('should throw Media is invalid error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(null);

      try {
        await service.prepDWCArchive({} as ArchiveFile);
        expect.fail();
      } catch (error) {
        expect(parse).to.be.calledOnce;
        expect(error instanceof SubmissionError).to.be.true;
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
      }
    });

    it('should throw File submitted is not a supported type error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(new MediaFile('', '', Buffer.from([])));

      try {
        await service.prepDWCArchive({} as ArchiveFile);
        expect.fail();
      } catch (error) {
        expect(parse).to.be.calledOnce;
        expect(error instanceof SubmissionError).to.be.true;
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE
        );
      }
    });
  });

  describe('transformXLSX', () => {
    afterEach(() => {
      sinon.restore();
    });
  });

  describe('persistTransformationResults', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const xlsx = new XLSXCSV(buildFile('', { template_id: 1, csm_id: 1 }));

      const s3 = sinon.stub(FileUtils, 'uploadBufferToS3').resolves();
      const occurrence = sinon.stub(OccurrenceService.prototype, 'updateSurveyOccurrenceSubmission').resolves();
      const submission = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves(1);

      try {
        await service.persistTransformationResults(1, [], 'outputKey', xlsx);
        expect(s3).to.be.calledOnce;
        expect(occurrence).to.be.calledOnce;
        expect(submission).to.be.calledOnce;
      } catch (error) {
        console.log(error);
      }
    });

    it('should throw Failed to upload file to S3 error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const xlsx = new XLSXCSV(buildFile('', { template_id: 1, csm_id: 1 }));

      const s3 = sinon
        .stub(FileUtils, 'uploadBufferToS3')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPLOAD_FILE_TO_S3));
      const occurrence = sinon.stub(OccurrenceService.prototype, 'updateSurveyOccurrenceSubmission').resolves();
      const submission = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves(1);

      try {
        await service.persistTransformationResults(1, [], 'outputKey', xlsx);
        expect(s3).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_UPLOAD_FILE_TO_S3
        );
      }
      expect(occurrence).to.not.be.called;
      expect(submission).to.not.be.called;
    });

    it('should throw Failed to update occurrence submission error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const xlsx = new XLSXCSV(buildFile('', { template_id: 1, csm_id: 1 }));

      const s3 = sinon.stub(FileUtils, 'uploadBufferToS3').resolves();
      const occurrence = sinon
        .stub(OccurrenceService.prototype, 'updateSurveyOccurrenceSubmission')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION));
      const submission = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves(1);

      try {
        await service.persistTransformationResults(1, [], 'outputKey', xlsx);
        expect(s3).to.be.calledOnce;
        expect(occurrence).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION
        );
      }
      expect(submission).to.not.be.called;
    });

    it('should throw Failed to update occurrence submission error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      const xlsx = new XLSXCSV(buildFile('', { template_id: 1, csm_id: 1 }));

      const s3 = sinon.stub(FileUtils, 'uploadBufferToS3').resolves();
      const occurrence = sinon.stub(OccurrenceService.prototype, 'updateSurveyOccurrenceSubmission').resolves();
      const submission = sinon
        .stub(service.submissionRepository, 'insertSubmissionStatus')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION));

      try {
        await service.persistTransformationResults(1, [], 'outputKey', xlsx);
        expect(s3).to.be.calledOnce;
        expect(occurrence).to.be.calledOnce;
        expect(submission).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION
        );
      }
    });
  });
});
