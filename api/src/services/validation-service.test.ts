import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import * as FileUtils from '../utils/file-utils';
import { MediaFile } from '../utils/media/media-file';
import  * as MediaUtils from '../utils/media/media-utils';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { SubmissionError } from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';
import { OccurrenceService } from './occurrence-service';
import { ValidationService } from './validation-service';

chai.use(sinonChai);

// const dbConnection = getMockDBConnection({
//   systemUserId: () => {
//     return 20;
//   }
// });

// const sampleReq = {
//   keycloak_token: {},
//   body: {
//     occurrence_submission_id: 1
//   }
// } as any;

describe.only('templateValidation', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should persist validation results', () => {
    
  });
  it('should throw Failed to validate error', () => {});
});

describe('templatePreperation', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return valid S3 key and xlsx object', async () => {
    const file = new MediaFile("test.txt", "text/plain", Buffer.of(0));
    const s3Key = "s3 key"
    sinon.stub(FileUtils, 'getFileFromS3').resolves("file from s3" as any);
    sinon.stub(ValidationService.prototype, 'prepXLSX').resolves(new XLSXCSV(file));
    sinon.stub(OccurrenceService.prototype, 'getOccurrenceSubmission').resolves({
      occurrence_submission_id: 1,
      survey_id: 1,
      template_methodology_species_id: 1,
      source: "",
      input_key: s3Key,
      input_file_name: "",
      output_key: "",
      output_file_name: "",
    });

    const dbConnection = getMockDBConnection();
    const service = new ValidationService(dbConnection);
    const results = await service.templatePreperation(1)
    
    expect(results.xlsx).to.not.be.empty;
    expect(results.xlsx instanceof XLSXCSV).to.be.true;
    expect(results.s3InputKey).to.be.eql(s3Key);
  });

  it('throws Failed to prepare submission error', async () => {
    const file = new MediaFile("test.txt", "text/plain", Buffer.of(0));
    const s3Key = "s3 key"
    sinon.stub(FileUtils, 'getFileFromS3').throws(new SubmissionError({}))
    sinon.stub(ValidationService.prototype, 'prepXLSX').resolves(new XLSXCSV(file));
    sinon.stub(OccurrenceService.prototype, 'getOccurrenceSubmission').resolves({
      occurrence_submission_id: 1,
      survey_id: 1,
      template_methodology_species_id: 1,
      source: "",
      input_key: s3Key,
      input_file_name: "",
      output_key: "",
      output_file_name: "",
    });

    try {
      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      await service.templatePreperation(1);

      expect.fail()
    } catch (error) {
      expect(error instanceof SubmissionError).to.be.true;
      if(error instanceof SubmissionError) {
        expect(error.status).to.be.eql(SUBMISSION_STATUS_TYPE.FAILED_OCCURRENCE_PREPERATION);
      }
    }
  });
});

describe('ValidationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('prepXLSX', () => {
    it('should return valid XLSXCSV', () => {
      const file = new MediaFile("test.txt", "text/plain", Buffer.of(0));
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(file);
      sinon.stub(XLSXCSV, 'prototype').returns({
        workbook:{
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
      const file = new MediaFile("test.txt", "text/plain", Buffer.of(0))
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(null);

      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      try {
        
        service.prepXLSX(file);
        expect.fail();
      } catch (error) {
        
        if (error instanceof SubmissionError) {
          expect(error.submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE)
        }

        expect(error instanceof SubmissionError).to.be.true;
        expect(parse).to.be.calledOnce;
      }
    });
    
    it('should throw Media is invalid error', () => {
      const file = new MediaFile("test.txt", "text/plain", Buffer.of(0))
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns("a file" as unknown as MediaFile);

      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      try {
        
        service.prepXLSX(file);
        expect.fail();
      } catch (error) {
        
        if (error instanceof SubmissionError) {
          expect(error.submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA)
        }

        expect(error instanceof SubmissionError).to.be.true;
        expect(parse).to.be.calledOnce;
      }
    });
    
    it('should throw Unable to get transform schema for submission error', () => {
      const file = new MediaFile("test.txt", "text/plain", Buffer.of(0))
      const parse = sinon.stub(MediaUtils, 'parseUnknownMedia').returns(file);

      const dbConnection = getMockDBConnection();
      const service = new ValidationService(dbConnection);
      try {
        
        service.prepXLSX(file);
        expect.fail();
      } catch (error) {
        
        if (error instanceof SubmissionError) {
          expect(error.submissionMessages[0].type).to.be.eql(SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TRANSFORM_SCHEMA)
        }

        expect(error instanceof SubmissionError).to.be.true;
        expect(parse).to.be.calledOnce;
      }
    });
  });


/*
  processFile
    templatePreperation
    templateValidation
    templateTransformation
    templateScrapeAnduploadOccurrences
  
  processDWCFile
    dwcPreparation
    validateDWC
    persistValidationResults
  
  scrapeOccurrences
  transformFile
  validateFile
  prepXLSX
  getValidationSchema
  getValidationRules
  validationXLSX
  getTransformationSchema
  getTransformationRules
  transformXLSX
  persistTransofmrationResults
  prepDWCArchive
  validateDWCArchive
  generateHeaderErrorMessage
  generateRowErrorMessage
*/

  // it('', async () => {
    // const dbConnection = getMockDBConnection();
    // const service = new ValidationService(dbConnection);
  // });
});
