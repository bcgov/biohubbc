import chai, { expect } from 'chai';
import { shuffle } from 'lodash';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import xlsx from 'xlsx';
import {
  MESSAGE_CLASS_NAME,
  SUBMISSION_MESSAGE_TYPE,
  SUBMISSION_STATUS_TYPE,
  SUMMARY_SUBMISSION_MESSAGE_TYPE
} from '../constants/status';
import { HTTP400 } from '../errors/http-error';
import { SummaryRepository } from '../repositories/summary-repository';
import * as FileUtils from '../utils/file-utils';
import { ICsvState } from '../utils/media/csv/csv-file';
import { IMediaState, MediaFile } from '../utils/media/media-file';
import * as MediaUtils from '../utils/media/media-utils';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import {
  MessageError,
  SubmissionError,
  SummarySubmissionError,
  SummarySubmissionErrorFromMessageType
} from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';
import { SummaryService } from './summary-service';
import { SurveyService } from './survey-service';

chai.use(sinonChai);

const mockService = () => {
  const dbConnection = getMockDBConnection();
  return new SummaryService(dbConnection);
};

const makeMockTemplateSpeciesRecord = (seed: number) => ({
  summary_template_species_id: seed + 1,
  summary_template_id: seed + 1,
  wldtaxonomic_units_id: 4165 + seed,
  validation: JSON.stringify({ test_schema_id: seed + 1 }),
  create_user: 1,
  update_date: null,
  update_user: null,
  revision_count: 1
});

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

describe('SummaryService', () => {
  afterEach(() => {
    sinon.restore();
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
      const mockError = SummarySubmissionErrorFromMessageType(
        SUMMARY_SUBMISSION_MESSAGE_TYPE.MISSING_VALIDATION_SCHEMA
      );
      const prep = sinon.stub(service, 'summaryTemplatePreparation').resolves(mockPrep);
      sinon.stub(service.summaryRepository, 'insertSummarySubmissionMessage').resolves();
      const validation = sinon.stub(service, 'summaryTemplateValidation').throws(mockError);

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

      try {
        await service.validateFile(1, 1);
        expect(prep).to.be.calledOnce;
        expect(validation).to.be.calledOnce;
      } catch (error) {
        expect(error).not.to.be.instanceOf(SubmissionError);
      }
    });
  });

  describe('updateSurveySummarySubmissionWithKey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should update a survey summary submission key', async () => {
      const service = mockService();
      const update = sinon
        .stub(service, 'updateSurveySummarySubmissionWithKey')
        .resolves({ survey_summary_submission_id: 12 });
      const result = await service.updateSurveySummarySubmissionWithKey(12, 'new-test-key');

      expect(update).to.be.calledOnce;
      expect(result).to.be.eql({ survey_summary_submission_id: 12 });
    });
  });

  describe('insertSurveySummarySubmission', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert a summary submission', async () => {
      const service = mockService();

      sinon
        .stub(SummaryRepository.prototype, 'insertSurveySummarySubmission')
        .resolves({ survey_summary_submission_id: 5 });
      const result = await service.insertSurveySummarySubmission(10, 'biohub-unit-testing', 'test-filename');

      expect(result).to.eql({ survey_summary_submission_id: 5 });
    });

    it('should throw an error if the repo fails to insert the summary submission', async () => {
      sinon
        .stub(SummaryRepository.prototype, 'insertSurveySummarySubmission')
        .throws(new HTTP400('Failed to insert survey summary submission record'));

      try {
        const service = mockService();
        await service.insertSurveySummarySubmission(10, 'biohub-unit-testing', 'test-filename');
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTP400).message).to.equal('Failed to insert survey summary submission record');
      }
    });
  });

  describe('deleteSummarySubmission', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return a row count of 1 when successfully deleting', async () => {
      const service = mockService();

      sinon.stub(SummaryRepository.prototype, 'deleteSummarySubmission').resolves(1);

      const result = await service.deleteSummarySubmission(10);

      expect(result).to.be.equal(1);
    });

    it('should return a row count of 0 when deleting an already delete submission', async () => {
      const service = mockService();

      sinon.stub(SummaryRepository.prototype, 'deleteSummarySubmission').resolves(0);

      const result = await service.deleteSummarySubmission(10);

      expect(result).to.be.equal(0);
    });

    it('should throw an error when the repo throws an error', async () => {
      sinon
        .stub(SummaryRepository.prototype, 'deleteSummarySubmission')
        .throws(new HTTP400('Failed to soft delete survey summary submission record'));

      try {
        const service = mockService();
        await service.deleteSummarySubmission(10);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTP400).message).to.equal('Failed to soft delete survey summary submission record');
      }
    });
  });

  describe('getSummarySubmissionMessages', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should successfully retreive an array of submission messages', async () => {
      const service = mockService();

      sinon.stub(SummaryRepository.prototype, 'getSummarySubmissionMessages').resolves([
        {
          id: 1,
          class: 'class1',
          type: 'type1',
          message: 'message1'
        },
        {
          id: 2,
          class: 'class2',
          type: 'type2',
          message: 'message2'
        }
      ]);

      const result = await service.getSummarySubmissionMessages(10);

      expect(result.length).to.be.equal(2);
      expect(result).to.be.eql([
        {
          id: 1,
          class: 'class1',
          type: 'type1',
          message: 'message1'
        },
        {
          id: 2,
          class: 'class2',
          type: 'type2',
          message: 'message2'
        }
      ]);
    });

    it('should return an empty array if the repo finds no messages', async () => {
      const service = mockService();

      sinon.stub(SummaryRepository.prototype, 'getSummarySubmissionMessages').resolves([]);

      const result = await service.getSummarySubmissionMessages(10);

      expect(result.length).to.be.equal(0);
      expect(result).to.be.eql([]);
    });

    it('should throw an error when the repo throws an error', async () => {
      sinon
        .stub(SummaryRepository.prototype, 'getSummarySubmissionMessages')
        .throws(new HTTP400('Failed to query survey summary submission table'));

      try {
        const service = mockService();
        await service.getSummarySubmissionMessages(10);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTP400).message).to.equal('Failed to query survey summary submission table');
      }
    });
  });

  describe('findSummarySubmissionById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should successfully retreive a submission', async () => {
      const service = mockService();

      sinon.stub(SummaryRepository.prototype, 'findSummarySubmissionById').resolves({
        survey_summary_submission_id: 10,
        survey_id: 1,
        source: 'source',
        event_timestamp: null,
        delete_timestamp: null,
        key: 's3Key',
        file_name: 'filename',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 1,
        summary_template_species_id: 1
      });

      const result = await service.findSummarySubmissionById(10);

      expect(result).to.be.eql({
        survey_summary_submission_id: 10,
        survey_id: 1,
        source: 'source',
        event_timestamp: null,
        delete_timestamp: null,
        key: 's3Key',
        file_name: 'filename',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 1,
        summary_template_species_id: 1
      });
    });

    it('should throw an error when the repo throws an error', async () => {
      sinon
        .stub(SummaryRepository.prototype, 'findSummarySubmissionById')
        .throws(new HTTP400('Failed to query survey summary submission table'));

      try {
        const service = mockService();
        await service.findSummarySubmissionById(10);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTP400).message).to.equal('Failed to query survey summary submission table');
      }
    });
  });

  describe('getLatestSurveySummarySubmission', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should successfully retreive a submission', async () => {
      const service = mockService();

      sinon.stub(SummaryRepository.prototype, 'getLatestSurveySummarySubmission').resolves({
        survey_summary_submission_id: 30,
        file_name: 'file13.xlsx',
        key: 's3_key',
        uuid: 'string',
        delete_timestamp: null,
        submission_message_type_id: 1,
        message: 'another error message',
        submission_message_type_name: 'Miscellaneous',
        summary_submission_message_class_id: 1,
        submission_message_class_name: MESSAGE_CLASS_NAME.ERROR
      });

      const result = await service.getLatestSurveySummarySubmission(20);

      expect(result).to.be.eql({
        survey_summary_submission_id: 30,
        file_name: 'file13.xlsx',
        key: 's3_key',
        uuid: 'string',
        delete_timestamp: null,
        submission_message_type_id: 1,
        message: 'another error message',
        submission_message_type_name: 'Miscellaneous',
        summary_submission_message_class_id: 1,
        submission_message_class_name: MESSAGE_CLASS_NAME.ERROR
      });
    });

    it('should throw an error when the repo throws an error', async () => {
      sinon
        .stub(SummaryRepository.prototype, 'getLatestSurveySummarySubmission')
        .throws(new HTTP400('Failed to query survey summary submission table'));

      try {
        const service = mockService();
        await service.getLatestSurveySummarySubmission(21);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTP400).message).to.equal('Failed to query survey summary submission table');
      }
    });
  });

  describe('summaryTemplatePreparation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid S3 key and xlsx object', async () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const s3Key = 's3-key';
      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);
      sinon.stub(SummaryService.prototype, 'prepXLSX').returns(new XLSXCSV(file));
      sinon.stub(SummaryService.prototype, 'findSummarySubmissionById').resolves({
        survey_summary_submission_id: 1,
        survey_id: 1,
        source: 'source',
        event_timestamp: null,
        delete_timestamp: null,
        key: s3Key,
        file_name: 'filename',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 1,
        summary_template_species_id: 1
      });

      const service = mockService();
      const results = await service.summaryTemplatePreparation(1);

      expect(results.xlsx).to.not.be.empty;
      expect(results.xlsx).to.be.instanceOf(XLSXCSV);
      expect(results.s3InputKey).to.be.eql(s3Key);
    });

    it('throws Failed to prepare submission error', async () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const s3Key = 's3-key';
      sinon.stub(FileUtils, 'getFileFromS3').throws(new SubmissionError({}));
      sinon.stub(SummaryService.prototype, 'prepXLSX').resolves(new XLSXCSV(file));
      sinon.stub(SummaryService.prototype, 'findSummarySubmissionById').resolves({
        survey_summary_submission_id: 1,
        survey_id: 1,
        source: 'source',
        event_timestamp: null,
        delete_timestamp: null,
        key: s3Key,
        file_name: 'filename',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 1,
        summary_template_species_id: 1
      });

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

    it('Should log the particular validation schema that was found if summarySubmissionId is given', async () => {
      const service = mockService();
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const xlsxCsv = new XLSXCSV(file);
      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);

      const getValidation = sinon
        .stub(service, 'getSummaryTemplateSpeciesRecords')
        .resolves([
          makeMockTemplateSpeciesRecord(99),
          makeMockTemplateSpeciesRecord(199),
          makeMockTemplateSpeciesRecord(299),
          makeMockTemplateSpeciesRecord(399)
        ]);

      const getRules = sinon.stub(service, 'getValidationRules').resolves('');
      const validate = sinon.stub(service, 'validateXLSX').resolves({});
      const persistResults = sinon.stub(service, 'persistSummaryValidationResults').resolves();

      const logFoundValidation = sinon.stub(SummaryRepository.prototype, 'insertSummarySubmissionMessage').resolves();

      await service.summaryTemplateValidation(xlsxCsv, 70, 60);

      expect(getValidation).to.be.calledOnce;
      expect(getRules).to.be.calledOnce;
      expect(validate).to.be.calledOnce;
      expect(persistResults).to.be.calledOnce;

      expect(logFoundValidation).to.be.calledOnce;
      expect(logFoundValidation).to.be.calledWith(
        60,
        SUMMARY_SUBMISSION_MESSAGE_TYPE.FOUND_VALIDATION,
        "Found validation having summary template species ID '100' among 4 record(s)."
      );
    });

    it('should complete without error', async () => {
      const service = mockService();
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const xlsxCsv = new XLSXCSV(file);
      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);

      const getValidation = sinon
        .stub(service, 'getSummaryTemplateSpeciesRecords')
        .resolves([makeMockTemplateSpeciesRecord(1)]);
      const getRules = sinon.stub(service, 'getValidationRules').resolves('');
      const validate = sinon.stub(service, 'validateXLSX').resolves({});
      const persistResults = sinon.stub(service, 'persistSummaryValidationResults').resolves();

      await service.summaryTemplateValidation(xlsxCsv, 1);

      expect(getValidation).to.be.calledOnce;
      expect(getRules).to.be.calledOnce;
      expect(validate).to.be.calledOnce;
      expect(persistResults).to.be.calledOnce;
    });

    it('should pick the first validation schema deterministically', async () => {
      const service = mockService();
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const xlsxCsv = new XLSXCSV(file);
      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);

      const templateSpeciesRecords = shuffle([...Array(20).keys()].map(makeMockTemplateSpeciesRecord));

      const getValidation = sinon.stub(service, 'getSummaryTemplateSpeciesRecords').resolves(templateSpeciesRecords);
      const getRules = sinon.stub(service, 'getValidationRules').resolves('');
      const validate = sinon.stub(service, 'validateXLSX').resolves({});
      const persistResults = sinon.stub(service, 'persistSummaryValidationResults').resolves();

      await service.summaryTemplateValidation(xlsxCsv, 1);

      expect(getValidation).to.be.calledOnce;
      expect(getRules).to.have.been.calledWith(templateSpeciesRecords[0].validation);
      expect(validate).to.be.calledOnce;
      expect(persistResults).to.be.calledOnce;
    });

    it('should throw FAILED_GET_VALIDATION_RULES error if no validation found', async () => {
      const service = mockService();
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const xlsxCsv = new XLSXCSV(file);

      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);
      sinon.stub(service, 'getSummaryTemplateSpeciesRecords').resolves([]);
      sinon.stub(service, 'getValidationRules').resolves({});

      try {
        await service.summaryTemplateValidation(xlsxCsv, 1);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SummarySubmissionError);
        if (error instanceof SummarySubmissionError) {
          expect(error.summarySubmissionMessages.length).to.equal(1);
          expect(error.summarySubmissionMessages[0].type).to.be.eql(
            SUMMARY_SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES
          );
        }
      }
    });

    it('should throw FAILED_PARSE_VALIDATION_SCHEMA error if getValidationRules fails', async () => {
      const service = mockService();
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const xlsxCsv = new XLSXCSV(file);
      sinon.stub(FileUtils, 'getFileFromS3').resolves('file from s3' as any);
      sinon.stub(service, 'getSummaryTemplateSpeciesRecords').resolves([
        {
          ...makeMockTemplateSpeciesRecord(1),
          validation: 'this validation string will fail'
        }
      ]);

      try {
        await service.summaryTemplateValidation(xlsxCsv, 1);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SummarySubmissionError);
        if (error instanceof SummarySubmissionError) {
          expect(error.summarySubmissionMessages.length).to.equal(1);
          expect(error.summarySubmissionMessages[0].type).to.be.eql(
            SUMMARY_SUBMISSION_MESSAGE_TYPE.FAILED_PARSE_VALIDATION_SCHEMA
          );
        }
      }
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
  });

  describe('prepXLSX', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return valid XLSXCSV', () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(file);
      sinon.stub(XLSXCSV.prototype, 'workbook').returns({
        rawWorkbook: {
          Custprops: {
            sims_template_id: 1,
            sims_csm_id: 1
          }
        }
      });

      const service = mockService();
      try {
        const xlsx = service.prepXLSX(file);
        expect(xlsx).to.not.be.empty;
        expect(xlsx).to.be.instanceOf(XLSXCSV);
      } catch (error) {
        expect(error).to.be.instanceOf(SummarySubmissionError);
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
        if (error instanceof SummarySubmissionError) {
          expect(error.summarySubmissionMessages[0].type).to.be.eql(
            SUMMARY_SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE
          );
        }

        expect(error).to.be.instanceOf(SummarySubmissionError);
        expect(parse).to.be.calledOnce;
      }
    });

    it('should throw `XLSX CSV is Invalid` error', () => {
      const file = new MediaFile('test.txt', 'text/plain', Buffer.of(0));
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(('a file' as unknown) as MediaFile);

      const service = mockService();
      try {
        service.prepXLSX(file);
        expect.fail();
      } catch (error) {
        if (error instanceof SummarySubmissionError) {
          expect(error.summarySubmissionMessages[0].type).to.be.eql(SUMMARY_SUBMISSION_MESSAGE_TYPE.INVALID_XLSX_CSV);
        }

        expect(error).to.be.instanceOf(SummarySubmissionError);
        expect(parse).to.be.calledOnce;
      }
    });
  });

  describe('getSummaryTemplateSpeciesRecords', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid `ISummaryTemplateSpeciesData[]`', async () => {
      const service = mockService();
      const mockSpecies = sinon.stub(SurveyService.prototype, 'getSpeciesData').resolves({
        focal_species: [],
        ancillary_species: []
      });
      const mockXLSX = ({
        workbook: {
          rawWorkbook: {
            Custprops: { sims_name: 'Moose SRB', sims_version: '1.0' }
          }
        }
      } as unknown) as XLSXCSV;
      const mockResults = [
        {
          summary_template_species_id: 1,
          summary_template_id: 1,
          wldtaxonomic_units_id: 1,
          validation: '',
          create_user: 1,
          update_date: '',
          update_user: 1,
          revision_count: 1
        }
      ];
      const mockRecords = sinon
        .stub(SummaryRepository.prototype, 'getSummaryTemplateSpeciesRecords')
        .resolves(mockResults);

      const results = await service.getSummaryTemplateSpeciesRecords(mockXLSX, 1);
      expect(results).to.be.eql(mockResults);
      expect(mockSpecies).to.be.called;
      expect(mockRecords).to.be.called;
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
  describe('validateXLSX', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return valid state object', async () => {
      const service = mockService();
      const xlsx = new XLSXCSV(buildFile('test file', {}));
      const parser = new ValidationSchemaParser({});
      const response = await service.validateXLSX(xlsx, parser);

      expect(response.media_state.isValid).to.be.true;
      expect(response.media_state.fileErrors).is.empty;
    });
  });

  describe('persistSummaryValidationResults', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a submission error with multiple messages attached', async () => {
      const service = mockService();
      const csvState: ICsvState[] = [
        {
          fileName: '',
          isValid: false,
          keyErrors: [],
          headerErrors: [
            {
              errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
              message: '',
              col: 'Effort & Effects'
            }
          ],
          rowErrors: []
        }
      ];
      const mediaState: IMediaState = {
        fileName: 'Test.xlsx',
        isValid: true
      };
      try {
        await service.persistSummaryValidationResults(csvState, mediaState);
        expect.fail();
      } catch (error) {
        if (error instanceof SummarySubmissionError) {
          error.summarySubmissionMessages.forEach((e) => {
            expect(e.type).to.be.eql(SUMMARY_SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER);
          });
        }
      }
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
      const error = new SummarySubmissionError({
        messages: [new MessageError(SUMMARY_SUBMISSION_MESSAGE_TYPE.MISSING_RECOMMENDED_HEADER)]
      });
      await mockService.insertSummarySubmissionError(1, error);

      expect(mockInsert).to.be.called;
    });
  });
});
