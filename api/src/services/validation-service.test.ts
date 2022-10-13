import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { MediaFile } from '../utils/media/media-file';
import  * as MediaUtils from '../utils/media/media-utils';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';
import { SubmissionError } from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';
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

describe.only('ValidationService', () => {
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
