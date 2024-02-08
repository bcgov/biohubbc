import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx from 'xlsx';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { ITemplateMethodologyData } from '../repositories/validation-repository';
import * as FileUtils from '../utils/file-utils';
import { ICsvState } from '../utils/media/csv/csv-file';
import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import { ArchiveFile, IMediaState, MediaFile } from '../utils/media/media-file';
import * as MediaUtils from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { TransformSchema } from '../utils/media/xlsx/transformation/xlsx-transform-schema-parser';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { SubmissionError, SubmissionErrorFromMessageType } from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';
import { OccurrenceService } from './occurrence-service';
import { ValidationService } from './validation-service';

chai.use(sinonChai);

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
  output_file_name: '',
  darwin_core_source: {}
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
      sinon.stub(ValidationService.prototype, 'getTemplateMethodologySpeciesRecord').resolves({
        template_methodology_species_id: 1,
        wldtaxonomic_units_id: '1',
        validation: '{}',
        transform: ('{}' as unknown) as TransformSchema
      });

      const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
      const schema = await service.getValidationSchema(file, 1);
      expect(schema).to.be.not.null;
    });

    it('should throw Failed to get validation rules error', async () => {
      const service = mockService();
      sinon
        .stub(ValidationService.prototype, 'getTemplateMethodologySpeciesRecord')
        .resolves(({} as unknown) as ITemplateMethodologyData);

      try {
        const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
        await service.getValidationSchema(file, 1);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceof(SubmissionError);
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
      sinon.stub(ValidationService.prototype, 'getTemplateMethodologySpeciesRecord').resolves({
        template_methodology_species_id: 1,
        wldtaxonomic_units_id: '1',
        validation: '{}',
        transform: ('{}' as unknown) as TransformSchema
      });

      const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
      const schema = await service.getTransformationSchema(file, 1);
      expect(schema).to.be.not.null;
    });

    it('should throw Failed to get transformation rules error', async () => {
      const service = mockService();
      sinon
        .stub(ValidationService.prototype, 'getTemplateMethodologySpeciesRecord')
        .resolves(({} as unknown) as ITemplateMethodologyData);

      try {
        const file = new XLSXCSV(buildFile('testFile', { template_id: 1, csm_id: 1 }));
        await service.getTransformationSchema(file, 1);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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
      const persistResults = sinon.stub(ValidationService.prototype, 'persistValidationResults').resolves();

      const service = mockService();
      await service.templateValidation(xlsxCsv, 1);

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
      sinon.stub(ValidationService.prototype, 'persistValidationResults').resolves();

      try {
        const dbConnection = getMockDBConnection();
        const service = new ValidationService(dbConnection);
        await service.templateValidation(xlsxCsv, 1);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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
      sinon.stub(ValidationService.prototype, 'prepXLSX').returns(new XLSXCSV(file));
      sinon.stub(OccurrenceService.prototype, 'getOccurrenceSubmission').resolves({
        occurrence_submission_id: 1,
        survey_id: 1,
        template_methodology_species_id: 1,
        source: '',
        input_key: s3Key,
        input_file_name: '',
        output_key: '',
        output_file_name: '',
        darwin_core_source: {}
      });

      const service = mockService();
      const results = await service.templatePreparation(1);

      expect(results.xlsx).to.not.be.empty;
      expect(results.xlsx).to.be.instanceOf(XLSXCSV);
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
        output_file_name: '',
        darwin_core_source: {}
      });

      try {
        const dbConnection = getMockDBConnection();
        const service = new ValidationService(dbConnection);
        await service.templatePreparation(1);

        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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
        expect(xlsx).to.be.instanceOf(XLSXCSV);
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

        expect(error).to.be.instanceOf(SubmissionError);
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

        expect(error).to.be.instanceOf(SubmissionError);
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

        expect(error).to.be.instanceOf(SubmissionError);
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
          keyErrors: [
            {
              errorCode: SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY,
              message: 'Key error',
              colNames: ['col1', 'col2'],
              rows: [2, 3, 4]
            }
          ],
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
          expect(error.submissionMessages.length).to.be.equal(3);
        }
      }
    });

    it('should pass if no errors are thrown', async () => {
      const service = mockService();
      const csvState: ICsvState[] = [
        {
          fileName: '',
          isValid: true,
          keyErrors: [],
          headerErrors: [],
          rowErrors: []
        }
      ];
      const mediaState: IMediaState = {
        fileName: 'Test.xlsx',
        isValid: true
      };

      const response = await service.persistValidationResults(csvState, mediaState);
      expect(response).to.be.undefined;
    });
  });

  describe('getValidationRules', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return validation schema parser', () => {
      const service = mockService();

      const parser = service.getValidationRules({});
      expect(parser).to.be.instanceOf(ValidationSchemaParser);
    });

    it('should fail with invalid json', () => {
      const service = mockService();
      sinon
        .stub(service, 'getValidationRules')
        .throws(new Error('ValidationSchemaParser - provided json was not valid JSON'));
      try {
        service.getValidationRules('---');
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.be.eql('ValidationSchemaParser - provided json was not valid JSON');
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

      await service.transformFile(1, 1);
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
        await service.transformFile(1, 1);
        expect(prep).to.be.calledOnce;
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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
        await service.transformFile(1, 1);
        expect(prep).to.be.calledOnce;
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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

      await service.validateFile(1, 1);
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
        await service.validateFile(1, 1);
        expect(prep).to.be.calledOnce;
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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

  describe('processDWCFile', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without issue', async () => {
      const service = mockService();

      const mockPrep = {
        s3InputKey: 'input_key',
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
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();
      // const normalize = sinon.stub(service, 'normalizeDWCArchive').resolves();
      const update = sinon.stub(service.occurrenceService, 'updateDWCSourceForOccurrenceSubmission').resolves();
      const scrape = sinon.stub(service, 'scrapeDwCAndUploadOccurrences').resolves();

      const workbookBuffer = sinon.stub(service, 'createWorkbookFromJSON').resolves('buffer');
      const upload = sinon
        .stub(service, 'uploadDwCWorkbookToS3')
        .resolves({ outputFileName: 'outputfilename', s3OutputKey: 's3outputkey' });

      const update2 = sinon.stub(service.occurrenceService, 'updateSurveyOccurrenceSubmissionWithOutputKey').resolves();

      await service.processDWCFile(1);
      expect(prep).to.be.calledOnce;
      expect(state).to.be.calledOnce;
      expect(persistResults).to.be.calledOnce;
      expect(update).to.be.calledOnce;
      expect(submissionStatus).to.be.called;
      // expect(normalize).to.be.called;
      expect(scrape).to.be.called;
      expect(workbookBuffer).to.be.called;
      expect(upload).to.be.called;
      expect(update2).to.be.calledWith(1, 'outputfilename', 's3outputkey');
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
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();
      // const normalize = sinon.stub(service, 'normalizeDWCArchive').resolves();
      const update = sinon
        .stub(service.occurrenceService, 'updateDWCSourceForOccurrenceSubmission')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION));
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      try {
        await service.processDWCFile(1);
        expect.fail();
      } catch (error) {
        expect(prep).to.be.calledOnce;
        expect(state).to.be.calledOnce;
        expect(persistResults).to.be.calledOnce;
        expect(submissionStatus).to.be.calledOnce;
        // expect(normalize).to.be.calledOnce;
        expect(update).to.be.calledOnce;

        expect(insertError).to.be.calledOnce;
      }
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
      const submissionStatus = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();
      const normalize = sinon.stub(service, 'normalizeDWCArchive').resolves();
      const update = sinon.stub(service.occurrenceService, 'updateDWCSourceForOccurrenceSubmission').throws();
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();

      try {
        await service.processDWCFile(1);
        expect(prep).to.be.calledOnce;
        expect(state).to.be.calledOnce;
        expect(persistResults).to.be.calledOnce;
        expect(update).to.be.calledOnce;
        expect(submissionStatus).to.be.calledOnce;
        expect(normalize).to.be.calledOnce;
      } catch (error) {
        expect(error).not.to.be.instanceOf(SubmissionError);
        expect(insertError).not.to.be.calledOnce;
      }
    });
  });

  describe('processXLSXFile', () => {
    afterEach(() => {
      sinon.restore();
    });

    it.skip('should insert submission error - for failing to transform', async () => {
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
      sinon.stub(service, 'scrapeDwCAndUploadOccurrences').resolves();
      sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();

      try {
        await service.processXLSXFile(1, 1);
        expect.fail();
      } catch {
        expect(prep).to.be.calledOnce;
        expect(validate).to.be.calledOnce;
        expect(transform).to.be.calledOnce;
        expect(insertError).to.be.calledOnce;
      }
    });

    it.skip('should throw unrecognized error', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: 'input key',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };

      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const validate = sinon.stub(service, 'templateValidation').resolves();
      const transform = sinon.stub(service, 'templateTransformation').throws();
      const insertError = sinon.stub(service.errorService, 'insertSubmissionError').resolves();
      sinon.stub(service, 'scrapeDwCAndUploadOccurrences').resolves();
      sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();

      try {
        await service.processXLSXFile(1, 1);
        expect(prep).to.be.calledOnce;
        expect(validate).to.be.calledOnce;
        expect(transform).to.be.calledOnce;
      } catch (error) {
        expect(error).not.to.be.instanceOf(SubmissionError);
        expect(insertError).not.to.be.calledOnce;
      }
    });

    it.skip('should run without error', async () => {
      const service = mockService();
      const mockPrep = {
        s3InputKey: 'input key',
        xlsx: new XLSXCSV(buildFile('test file', {}))
      };

      const prep = sinon.stub(service, 'templatePreparation').resolves(mockPrep);
      const validate = sinon.stub(service, 'templateValidation').resolves();
      const status = sinon.stub(service.submissionRepository, 'insertSubmissionStatus').resolves();
      const transform = sinon.stub(service, 'templateTransformation').resolves();
      const update = sinon.stub(service.occurrenceService, 'updateDWCSourceForOccurrenceSubmission').resolves();
      const upload = sinon.stub(service, 'scrapeDwCAndUploadOccurrences').resolves();
      const workbook = sinon.stub(service, 'createWorkbookFromJSON').returns([]);
      const uploadWorkbook = sinon
        .stub(service, 'uploadDwCWorkbookToS3')
        .resolves({ outputFileName: '', s3OutputKey: '' });
      const updatedOutput = sinon
        .stub(service.occurrenceService, 'updateSurveyOccurrenceSubmissionWithOutputKey')
        .resolves();

      await service.processXLSXFile(1, 1);
      expect(prep).to.be.calledOnce;
      expect(validate).to.be.calledOnce;
      expect(transform).to.be.calledOnce;
      expect(upload).to.be.calledOnce;
      expect(status).to.be.calledTwice;
      expect(update).to.be.calledOnce;
      expect(workbook).to.be.calledOnce;
      expect(uploadWorkbook).to.be.calledOnce;
      expect(updatedOutput).to.be.calledOnce;
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
        await service.dwcPreparation(1);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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
        await service.dwcPreparation(1);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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
        await service.dwcPreparation(1);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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
        keyErrors: [
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY,
            message: 'Key error',
            colNames: ['col1', 'col2'],
            rows: [2, 3, 4]
          }
        ],
        headerErrors: [
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER,
            message: 'Duplicate Header found',
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
      sinon.stub(DWCArchive.prototype, 'getContentState').returns([mockState]);
      const response = await service.validateDWC(mockDWCArchive);
      expect(response.csv_state).is.not.empty;
      expect(response.csv_state[0].headerErrors).is.not.empty;
      expect(response.csv_state[0].rowErrors).is.not.empty;
      expect(response.csv_state[0].keyErrors).is.not.empty;
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
      sinon.stub(DWCArchive.prototype, 'getMediaState').returns(mockState);
      try {
        await service.validateDWC(mockDWCArchive);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA);
      }
    });
  });

  describe('scrapeDwCAndUploadOccurrences', () => {
    it('should run without issue', async () => {
      const service = mockService();

      const scrape = sinon.stub(service.spatialService, 'runSpatialTransforms').resolves();

      await service.scrapeDwCAndUploadOccurrences(1);

      expect(scrape).to.be.calledOnce;
    });

    it('should throw Submission Error', async () => {
      const service = mockService();

      const scrape = sinon
        .stub(service.spatialService, 'runSpatialTransforms')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA));

      try {
        await service.scrapeDwCAndUploadOccurrences(1);

        expect(scrape).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
      }
    });
  });

  describe('templateTransformation', () => {
    it('should run without issue', async () => {
      const file = buildFile('test file', { csm_id: 1, template_id: 1 });
      const xlsxCsv = new XLSXCSV(file);
      const fileBuffer = {
        name: '',
        buffer: Buffer.from([])
      } as any;

      const service = mockService();

      const getTransformation = sinon
        .stub(service, 'getTransformationSchema')
        .resolves(({} as unknown) as TransformSchema);
      const transform = sinon.stub(service, 'transformXLSX').resolves([fileBuffer]);

      await service.templateTransformation(xlsxCsv, 1);

      expect(getTransformation).to.be.calledOnce;
      expect(transform).to.be.calledOnce;
    });

    it('should Submission Error', async () => {
      const file = buildFile('test file', { csm_id: 1, template_id: 1 });
      const xlsxCsv = new XLSXCSV(file);

      const service = mockService();

      const getTransformation = sinon
        .stub(service, 'getTransformationSchema')
        .resolves(({} as unknown) as TransformSchema);
      const transform = sinon
        .stub(service, 'transformXLSX')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPLOAD_FILE_TO_S3));

      try {
        await service.templateTransformation(xlsxCsv, 1);
        expect(getTransformation).to.be.calledOnce;
        expect(transform).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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

    it('should return early if media_state is invalid', async () => {
      const service = mockService();
      const mockMediaState = {
        fileName: 'test file',
        isValid: false
      } as IMediaState;
      const xlsx = new XLSXCSV(buildFile('test file', {}));
      const parser = new ValidationSchemaParser({});

      sinon.stub(XLSXCSV.prototype, 'getMediaState').returns(mockMediaState);

      const result = await service.validateXLSX(xlsx, parser);

      expect(result.csv_state).to.be.eql([]);
      expect(result.media_state.fileName).to.be.eql(mockMediaState.fileName);
      expect(result.media_state.isValid).to.be.eql(false);
    });

    it('should return valid state object with content errors', async () => {
      const service = mockService();
      const mockState = {
        fileName: 'test',
        isValid: false,
        keyErrors: [
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY,
            message: 'Key error',
            colNames: ['col1', 'col2'],
            rows: [2, 3, 4]
          }
        ],
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
      sinon.stub(DWCArchive.prototype, 'validateContent');
      sinon.stub(XLSXCSV.prototype, 'getContentState').returns([mockState]);

      const response = await service.validateXLSX(xlsx, parser);
      expect(response.csv_state).is.not.empty;
      expect(response.csv_state[0].headerErrors).is.not.empty;
      expect(response.csv_state[0].rowErrors).is.not.empty;
      expect(response.csv_state[0].keyErrors).is.not.empty;
    });
  });

  describe('validateDWCArchive', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid ICsvMediaState object', () => {
      const service = mockService();

      sinon.stub(DWCArchive.prototype, 'validateMedia');
      sinon.stub(DWCArchive.prototype, 'validateContent');
      const mock = sinon.stub(DWCArchive.prototype, 'getMediaState').returns({
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
      sinon.stub(DWCArchive.prototype, 'validateMedia');
      const mock = sinon.stub(DWCArchive.prototype, 'getMediaState').returns({
        isValid: false,
        fileName: ''
      });

      try {
        const dwcArchive = new DWCArchive(new ArchiveFile('', '', Buffer.from([]), []));
        service.validateDWCArchive(dwcArchive, {} as ValidationSchemaParser);
        expect(mock).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
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
        expect(error).to.be.instanceOf(SubmissionError);
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
        expect(error).to.be.instanceOf(SubmissionError);
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE
        );
      }
    });
  });

  describe('uploadDwCWorkbookToS3', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without error', async () => {
      const service = mockService();
      const xlsx = new XLSXCSV(buildFile('', { template_id: 1, csm_id: 1 }));

      const s3 = sinon.stub(FileUtils, 'uploadBufferToS3').resolves();

      await service.uploadDwCWorkbookToS3(1, [], 'outputKey', xlsx);
      expect(s3).to.be.calledOnce;
    });

    it('should throw Failed to upload file to S3 error', async () => {
      const service = mockService();
      const xlsx = new XLSXCSV(buildFile('', { template_id: 1, csm_id: 1 }));

      const s3 = sinon
        .stub(FileUtils, 'uploadBufferToS3')
        .throws(SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPLOAD_FILE_TO_S3));

      try {
        await service.uploadDwCWorkbookToS3(1, [], 'outputKey', xlsx);
        expect(s3).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_UPLOAD_FILE_TO_S3
        );
      }
    });
  });
});
