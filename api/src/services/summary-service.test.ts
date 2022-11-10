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

describe('SummaryService', () => {
  afterEach(() => {
    sinon.restore();
  });

  // Part A

  describe('validateFile', () => {
    afterEach(() => {
      sinon.restore();
    });

  });

  describe('updateSurveySummarySubmissionWithKey', () => {
    afterEach(() => {
      sinon.restore();
    });

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


  // Part B



  describe('summaryTemplatePreparation', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
  describe('summaryTemplateValidation', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
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

  });

  describe('insertSummarySubmissionError', () => {
    afterEach(() => {
      sinon.restore();
    });

  });
});
