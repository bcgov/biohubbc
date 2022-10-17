import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx from 'xlsx';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { ValidationRepository } from '../repositories/validation-repository';
import * as FileUtils from '../utils/file-utils';
import { ICsvState } from '../utils/media/csv/csv-file';
import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
// import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import { ArchiveFile, IMediaState, MediaFile } from '../utils/media/media-file';
import * as MediaUtils from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { TransformationSchemaParser } from '../utils/media/xlsx/transformation/transformation-schema-parser';
import { XLSXTransformation } from '../utils/media/xlsx/transformation/xlsx-transformation';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { SubmissionError, SubmissionErrorFromMessageType } from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';
import { OccurrenceService } from './occurrence-service';
import { ValidationService } from './validation-service';

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
  return new ValidationService(dbConnection);
};

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

describe('ValidationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getValidationSchema', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid schema', async () => {
      const service = mockService();
      sinon.stub(ValidationRepository.prototype, 'getTemplateMethodologySpeciesRecord').resolves({
        validation: { id: 1 }
      });

      const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
      const schema = await service.getValidationSchema(file);
      expect(schema).to.be.not.null;
    });

    it('should throw Failed to get validation rules error', async () => {
      const service = mockService();
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
      const service = mockService();
      sinon.stub(ValidationRepository.prototype, 'getTemplateMethodologySpeciesRecord').resolves({
        transform: { id: 1 }
      });

      const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
      const schema = await service.getTransformationSchema(file);
      expect(schema).to.be.not.null;
    });

    it('should throw Failed to get transformation rules error', async () => {
      const service = mockService();
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

      const service = mockService();
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

      const service = mockService();
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

      const service = mockService();
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

      const service = mockService();
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

      const service = mockService();
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

      const service = mockService();
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
      const service = mockService();
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
      const service = mockService();
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
      const service = mockService();

      const parser = service.getValidationRules({});
      expect(parser instanceof ValidationSchemaParser).to.be.true;
    });

    it('should fail with invalid json', () => {
      const service = mockService()
      sinon.stub(service, 'getValidationRules').throws(new Error('ValidationSchemaParser - provided json was not valid JSON'))
      try {
        service.getValidationRules('---');
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.be.eql('ValidationSchemaParser - provided json was not valid JSON')
      }
    });
  });

  describe('getTransformationRules', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return validation schema parser', () => {
      const service = mockService();

      const parser = service.getTransformationRules({});
      expect(parser instanceof TransformationSchemaParser).to.be.true;
    });

    it('should fail with invalid json', () => {
      const service = mockService()
      sinon.stub(service, 'getTransformationRules').throws(new Error('TransformationSchemaParser - provided validationSchema was not valid JSON'))
      try {
        service.getTransformationRules('---');
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.be.eql('TransformationSchemaParser - provided validationSchema was not valid JSON')
      }
    });
  });

  describe('scrapeOccurrences', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without issue', async () => {
      const service = mockService();
      const scrapeUpload = sinon.stub(service, 'templateScrapeAndUploadOccurrences').resolves();

      await service.scrapeOccurrences(1);
      expect(scrapeUpload).to.be.calledOnce;
    });

    it('should insert submission error', async () => {
      const service = mockService();
      const scrapeUpload = sinon
        .stub(service, 'templateScrapeAndUploadOccurrences')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION));
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      // expect.fail();
      try {
        await service.scrapeOccurrences(1);
        expect(scrapeUpload).to.be.calledOnce;
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        expect(insertError).to.be.calledOnce;
      }
    });

    it('should throw error', async () => {
      const service = mockService();
      const scrapeUpload = sinon.stub(service, 'templateScrapeAndUploadOccurrences').throws(new Error());
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      try {
        await service.scrapeOccurrences(1);
        expect(scrapeUpload).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.false;
        expect(insertError).not.be.calledOnce;
      }
    });
  });

  describe('transformFile', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without issue', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };
      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const transform = sinon.stub(service, 'templateTransformation').resolves();
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();

      await service.transformFile(1);
      expect(prep).to.be.calledOnce;
      expect(transform).to.be.calledOnce;
      expect(submissionStatus).to.be.calledOnce;
    });

    it('should insert submission error', async () => {
      const service = mockService();
      const prep = sinon
        .stub(service, 'templatePreparation')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE));
      const transform = sinon.stub(service, 'templateTransformation').resolves();
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      try {
        await service.transformFile(1);
        expect(prep).to.be.calledOnce;
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        expect(transform).not.to.be.calledOnce;
        expect(submissionStatus).not.to.be.calledOnce;
        expect(insertError).to.be.calledOnce;
      }
    });

    it('should throw error', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };
      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const transform = sinon.stub(service, 'templateTransformation').resolves();
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').throws();

      try {
        await service.transformFile(1);
        expect(prep).to.be.calledOnce;
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.false;
        expect(transform).not.to.be.calledOnce;
        expect(submissionStatus).not.to.be.calledOnce;
        expect(insertError).not.to.be.calledOnce;
        expect.fail();
      }
    });
  });

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
      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const validation = sinon.stub(service, 'templateValidation').resolves();
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();

      await service.validateFile(1);
      expect(prep).to.be.calledOnce;
      expect(validation).to.be.calledOnce;
      expect(submissionStatus).to.be.calledOnce;
    });

    it('should insert submission error', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };
      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const validation = sinon
        .stub(service, 'templateValidation')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.MISSING_VALIDATION_SCHEMA));
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      try {
        await service.validateFile(1);
        expect(prep).to.be.calledOnce;
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        expect(insertError).to.be.calledOnce;
        expect(validation).not.to.be.calledOnce;
        expect(submissionStatus).not.to.be.calledOnce;
      }
    });

    it('should throw', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };
      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const validation = sinon.stub(service, 'templateValidation').throws(new Error());
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      try {
        await service.validateFile(1);
        expect(prep).to.be.calledOnce;
        expect(validation).to.be.calledOnce;
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.false;
        expect(insertError).not.to.be.calledOnce;
        expect(submissionStatus).not.to.be.calledOnce;
      }
    });
  });

  describe('processDWCFile', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without issue', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        archive: new DWCArchive(new ArchiveFile('test', 'application/zip', Buffer.from([]), [buildFile('test', {})]))
      };
      const mockState = {
        csv_state: [],
        media_state: {
          fileName: 'test',
          fileErrors: [],
          isValid: true
        }
      };

      const prep = sinon.stub(service, 'dwcPreparation').resolves(mockPrep);
      const state = sinon.stub(service, 'validateDWC').returns(mockState);
      const persistResults = sinon.stub(service, 'persistValidationResults').resolves();
      const update = sinon.stub(service.occurrenceService, 'updateSurveyOccurrenceSubmission').resolves();

      await service.processDWCFile(1);
      expect(prep).to.be.calledOnce;
      expect(state).to.be.calledOnce;
      expect(persistResults).to.be.calledOnce;
      expect(update).to.be.calledOnce;
    });

    it('should insert submission error from prep failure', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        archive: new DWCArchive(new ArchiveFile('test', 'application/zip', Buffer.from([]), [buildFile('test', {})]))
      };
      const mockState = {
        csv_state: [],
        media_state: {
          fileName: 'test',
          fileErrors: [],
          isValid: true
        }
      };

      const prep = sinon.stub(service, 'dwcPreparation').resolves(mockPrep);
      const state = sinon.stub(service, 'validateDWC').returns(mockState);
      const persistResults = sinon.stub(service, 'persistValidationResults').resolves();
      const update = sinon
        .stub(service.occurrenceService, 'updateSurveyOccurrenceSubmission')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION));
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      await service.processDWCFile(1);
      expect(prep).to.be.calledOnce;
      expect(state).to.be.calledOnce;
      expect(persistResults).to.be.calledOnce;
      expect(update).to.be.calledOnce;

      expect(insertError).to.be.calledOnce;
    });

    it('should throw unrecognized error', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: '',
        archive: new DWCArchive(new ArchiveFile('test', 'application/zip', Buffer.from([]), [buildFile('test', {})]))
      };
      const mockState = {
        csv_state: [],
        media_state: {
          fileName: 'test',
          fileErrors: [],
          isValid: true
        }
      };

      const prep = sinon.stub(service, 'dwcPreparation').resolves(mockPrep);
      const state = sinon.stub(service, 'validateDWC').returns(mockState);
      const persistResults = sinon.stub(service, 'persistValidationResults').resolves();
      const update = sinon.stub(service.occurrenceService, 'updateSurveyOccurrenceSubmission').throws();
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      try {
        await service.processDWCFile(1);
        expect(prep).to.be.calledOnce;
        expect(state).to.be.calledOnce;
        expect(persistResults).to.be.calledOnce;
        expect(update).to.be.calledOnce;
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.false;
        expect(insertError).not.to.be.calledOnce;
      }
    });
  });

  describe('processFile', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without error', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: 'input key',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };

      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const validate = sinon.stub(service, 'templateValidation').resolves();
      const transform = sinon.stub(service, 'templateTransformation').resolves();
      const upload = sinon.stub(service, 'templateScrapeAndUploadOccurrences').resolves();
      const status = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();

      await service.processFile(1);
      expect(prep).to.be.calledOnce;
      expect(validate).to.be.calledOnce;
      expect(transform).to.be.calledOnce;
      expect(upload).to.be.calledOnce;
      expect(status).to.be.calledTwice;
    });

    it('should insert submission error', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: 'input key',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };

      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const validate = sinon.stub(service, 'templateValidation').resolves();
      const transform = sinon
        .stub(service, 'templateTransformation')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_TRANSFORM_XLSX));
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();
      sinon.stub(service, 'templateScrapeAndUploadOccurrences').resolves();
      sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();

      await service.processFile(1);
      expect(prep).to.be.calledOnce;
      expect(validate).to.be.calledOnce;
      expect(transform).to.be.calledOnce;
      expect(insertError).to.be.calledOnce;
    });

    it('should throw unrecognized error', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: 'input key',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };

      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const validate = sinon.stub(service, 'templateValidation').resolves();
      const transform = sinon.stub(service, 'templateTransformation').throws();
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();
      sinon.stub(service, 'templateScrapeAndUploadOccurrences').resolves();
      sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();

      try {
        await service.validateFile(1);
        expect(prep).to.be.calledOnce;
        expect(validate).to.be.calledOnce;
        expect(transform).to.be.calledOnce;
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.false;
        expect(insertError).not.to.be.calledOnce;
      }
    });
  });

  describe('dwcPreparation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return archive and input key', async () => {
      const service = mockService();
      const archive = new DWCArchive(new ArchiveFile('', '', Buffer.from([]), []));
      const occurrence = sinon
        .stub(service.occurrenceService, 'getOccurrenceSubmission')
        .resolves(mockOccurrenceSubmission);
      const s3 = sinon.stub(FileUtils, 'getFileFromS3').resolves();
      const prep = sinon.stub(service, 'prepDWCArchive').returns(archive);

      const results = await service.dwcPreparation(1);
      expect(results.s3InputKey).to.not.be.empty;
      expect(occurrence).to.be.calledOnce;
      expect(s3).to.be.calledOnce;
      expect(prep).to.be.calledOnce;
    });

    it('should throw Failed to process occurrence error', async () => {
      const service = mockService();
      const archive = new DWCArchive(new ArchiveFile('', '', Buffer.from([]), []));
      sinon
        .stub(service.occurrenceService, 'getOccurrenceSubmission')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE));
      sinon.stub(FileUtils, 'getFileFromS3').resolves();
      sinon.stub(service, 'prepDWCArchive').returns(archive);

      try {
        await service.dwcPreparation(1)
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        expect((error as SubmissionError).status).to.be.eql(SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA);
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE
        );
      }
    });

    it('should throw Failed to process occurrence data with S3 messages', async () => {
      const service = mockService();
      const archive = new DWCArchive(new ArchiveFile('', '', Buffer.from([]), []));
      sinon.stub(service.occurrenceService, 'getOccurrenceSubmission').resolves(mockOccurrenceSubmission);
      sinon
        .stub(FileUtils, 'getFileFromS3')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_FILE_FROM_S3));
      sinon.stub(service, 'prepDWCArchive').returns(archive);

      try {
        await service.dwcPreparation(1)
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        expect((error as SubmissionError).status).to.be.eql(SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA);
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_GET_FILE_FROM_S3
        );
      }
    });

    it('should throw Media is invalid error', async () => {
      const service = mockService();
      sinon.stub(service.occurrenceService, 'getOccurrenceSubmission').resolves(mockOccurrenceSubmission);
      sinon.stub(FileUtils, 'getFileFromS3').resolves();
      sinon
        .stub(service, 'prepDWCArchive')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA));

      try {
        await service.dwcPreparation(1)
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        expect((error as SubmissionError).status).to.be.eql(SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA);
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
      }
    });
  });

  describe('validateDWC', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid ICsvMediaState', async () => {
      const service = mockService();
      const mockDWCArchive = new DWCArchive(
        new ArchiveFile('test', 'application/zip', Buffer.from([]), [buildFile('test', {})])
      );

      const response = await service.validateDWC(mockDWCArchive);
      expect(response.media_state.isValid).to.be.true;
      expect(response.media_state.fileErrors).is.empty;
    });

    it('should return file validation errors', async () => {
      const service = mockService();
      const mockDWCArchive = new DWCArchive(
        new ArchiveFile('test', 'application/zip', Buffer.from([]), [buildFile('test', {})])
      );
      const mockState = {
        fileName: 'test',
        isValid: false,
        headerErrors: [
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER,
            message: 'Duplicate header found',
            col: 1
          }
        ],
        rowErrors: [
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_FIELD,
            message: 'Missing required field',
            col: '1',
            row: 1
          }
        ]
      } as ICsvState;
      sinon.stub(DWCArchive.prototype, 'isContentValid').returns([mockState]);
      const response = await service.validateDWC(mockDWCArchive);
      expect(response.csv_state).is.not.empty;
      expect(response.csv_state[0].headerErrors).is.not.empty;
      expect(response.csv_state[0].rowErrors).is.not.empty;
    });

    it('should throw Failed to validate error', async () => {
      const service = mockService();
      const mockDWCArchive = new DWCArchive(
        new ArchiveFile('test', 'application/zip', Buffer.from([]), [buildFile('test', {})])
      );
      const mockState = {
        fileName: '',
        fileErrors: ['some file error'],
        isValid: false
      } as IMediaState;
      sinon.stub(DWCArchive.prototype, 'isMediaValid').returns(mockState);
      try {
        await service.validateDWC(mockDWCArchive);
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
      }
    });
  });

  describe('templateScrapeAndUploadOccurrences', () => {
    it('should run without issue', async () => {
      const service = mockService();
      const mockDWCArchive = new DWCArchive(new ArchiveFile('', '', Buffer.from([]), []));

      const occurrence = sinon
        .stub(service.occurrenceService, 'getOccurrenceSubmission')
        .resolves(mockOccurrenceSubmission);
      const file = sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);
      const archive = sinon.stub(service, 'prepDWCArchive').resolves(mockDWCArchive);
      const scrape = sinon.stub(service.occurrenceService, 'scrapeAndUploadOccurrences').resolves();

      await service.templateScrapeAndUploadOccurrences(1);

      expect(occurrence).to.be.calledOnce;
      expect(file).to.be.calledOnce;
      expect(archive).to.be.calledOnce;
      expect(scrape).to.be.calledOnce;
    });

    it('should throw Submission Error', async () => {
      const service = mockService();

      const occurrence = sinon
        .stub(service.occurrenceService, 'getOccurrenceSubmission')
        .resolves(mockOccurrenceSubmission);
      const file = sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);
      const archive = sinon
        .stub(service, 'prepDWCArchive')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA));
      const scrape = sinon.stub(service.occurrenceService, 'scrapeAndUploadOccurrences').resolves();

      try {
        await service.templateScrapeAndUploadOccurrences(1);

        expect(occurrence).to.be.calledOnce;
        expect(file).to.be.calledOnce;
        expect(archive).to.be.calledOnce;
        expect(scrape).not.to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
      }
    });
  });

  describe('templateTransformation', () => {
    it('should run without issue', async () => {
      const file = buildFile('test file', { csm_id: 1, template_id: 1 });
      const xlsxCsv = new XLSXCSV(file);
      const parser = new TransformationSchemaParser({});
      const fileBuffer = {
        name: '',
        buffer: Buffer.from([])
      } as any;

      const service = mockService();

      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);

      const getTransformation = sinon.stub(service, 'getTransformationSchema').resolves({});
      const getRules = sinon.stub(service, 'getTransformationRules').resolves(parser);
      const transform = sinon.stub(service, 'transformXLSX').resolves([fileBuffer]);
      const persistResults = sinon.stub(service, 'persistTransformationResults').resolves();

      await service.templateTransformation(1, xlsxCsv, '');

      expect(getTransformation).to.be.calledOnce;
      expect(getRules).to.be.calledOnce;
      expect(transform).to.be.calledOnce;
      expect(persistResults).to.be.calledOnce;
    });

    it('should Submission Error', async () => {
      const file = buildFile('test file', { csm_id: 1, template_id: 1 });
      const xlsxCsv = new XLSXCSV(file);
      const parser = new TransformationSchemaParser({});
      const fileBuffer = {
        name: '',
        buffer: Buffer.from([])
      } as any;

      const service = mockService();

      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);

      const getTransformation = sinon.stub(service, 'getTransformationSchema').resolves({});
      const getRules = sinon.stub(service, 'getTransformationRules').resolves(parser);
      const transform = sinon.stub(service, 'transformXLSX').resolves([fileBuffer]);
      const persistResults = sinon
        .stub(service, 'persistTransformationResults')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPLOAD_FILE_TO_S3));

      try {
        await service.templateTransformation(1, xlsxCsv, '');
        expect(getTransformation).to.be.calledOnce;
        expect(getRules).to.be.calledOnce;
        expect(transform).to.be.calledOnce;
        expect(persistResults).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
      }
    });
  });

  describe('validateXLSX', () => {
    it('should return valid state object', async () => {
      const service = mockService();
      const xlsx = new XLSXCSV(buildFile('test file', {}));
      const parser = new ValidationSchemaParser({});
      const response = await service.validateXLSX(xlsx, parser);

      expect(response.media_state.isValid).to.be.true;
      expect(response.media_state.fileErrors).is.empty;
    });

    it('should throw Media is invalid error', async () => {
      const service = mockService();
      const mockMediaState = {
        fileName: 'test file',
        isValid: false
      } as IMediaState;
      const xlsx = new XLSXCSV(buildFile('test file', {}));
      const parser = new ValidationSchemaParser({});

      sinon.stub(XLSXCSV.prototype, 'isMediaValid').returns(mockMediaState);

      try {
        await service.validateXLSX(xlsx, parser);
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
      }
    });

    it('should return valid state object with content errors', async () => {
      const service = mockService();
      const mockState = {
        fileName: 'test',
        isValid: false,
        headerErrors: [
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER,
            message: 'Duplicate header found',
            col: 1
          }
        ],
        rowErrors: [
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_FIELD,
            message: 'Missing required field',
            col: '1',
            row: 1
          }
        ]
      } as ICsvState;
      const xlsx = new XLSXCSV(buildFile('test file', {}));
      const parser = new ValidationSchemaParser({});
      sinon.stub(XLSXCSV.prototype, 'isContentValid').returns([mockState]);

      const response = await service.validateXLSX(xlsx, parser);
      expect(response.csv_state).is.not.empty;
      expect(response.csv_state[0].headerErrors).is.not.empty;
      expect(response.csv_state[0].rowErrors).is.not.empty;
    });
  });

  describe('validateDWCArchive', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid ICsvMediaState object', () => {
      const service = mockService();

      const mock = sinon.stub(DWCArchive.prototype, 'isMediaValid').returns({
        isValid: true,
        fileName: ''
      });

      const dwcArchive = new DWCArchive(new ArchiveFile('', '', Buffer.from([]), []));
      const csvMediaState = service.validateDWCArchive(dwcArchive, {} as ValidationSchemaParser);
      expect(mock).to.be.calledOnce;
      expect(csvMediaState).has.property('csv_state');
      expect(csvMediaState).has.property('media_state');
    });

    it('should throw Media is invalid error', () => {
      const service = mockService();
      const mock = sinon.stub(DWCArchive.prototype, 'isMediaValid').returns({
        isValid: false,
        fileName: ''
      });

      try {
        const dwcArchive = new DWCArchive(new ArchiveFile('', '', Buffer.from([]), []));
        service.validateDWCArchive(dwcArchive, {} as ValidationSchemaParser);
        expect(mock).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect(error instanceof SubmissionError).to.be.true;
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
      }
    });
  });

  describe('prepDWCArchive', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return a DWCArchive', async () => {
      const service = mockService();
      const fileName = 'test file';
      const parse = sinon
        .stub(MediaUtils, 'parseUnknownMedia')
        .returns(new ArchiveFile(fileName, '', Buffer.from([]), []));

      const archive = await service.prepDWCArchive({} as ArchiveFile);
      expect(archive.rawFile.fileName).to.be.eql(fileName);
      expect(parse).to.be.calledOnce;
    });

    it('should throw Media is invalid error', async () => {
      const service = mockService();
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
      const service = mockService();
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

    it('should return buffer of worksheets', async () => {
      const service = mockService();
      const xlsx = new XLSXCSV(buildFile('', { template_id: 1, csm_id: 1 }));

      const transformation = sinon.stub(XLSXTransformation.prototype, 'transform').resolves({});
      const dataToSheet = sinon.stub(XLSXTransformation.prototype, 'dataToSheet').returns({});

      const fileBuffer = await service.transformXLSX(xlsx, new TransformationSchemaParser({}));
      expect(transformation).to.be.calledOnce;
      expect(dataToSheet).to.be.calledOnce;
      expect(fileBuffer).to.be.eql([]);
    });
  });

  describe('persistTransformationResults', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without error', async () => {
      const service = mockService();
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
      }
    });

    it('should throw Failed to upload file to S3 error', async () => {
      const service = mockService();
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
      const service = mockService();
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
      const service = mockService();
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
