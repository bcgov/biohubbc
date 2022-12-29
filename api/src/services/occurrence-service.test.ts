import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { HTTP400 } from '../errors/http-error';
import { PostOccurrence } from '../models/occurrence-create';
import { OccurrenceRepository } from '../repositories/occurrence-repository';
import { CSVWorksheet } from '../utils/media/csv/csv-file';
import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import { ArchiveFile } from '../utils/media/media-file';
import { SubmissionError } from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';
import { OccurrenceService } from './occurrence-service';

chai.use(sinonChai);

describe('OccurrenceService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockService = () => {
    const dbConnection = getMockDBConnection();
    return new OccurrenceService(dbConnection);
  };

  it('should return a post occurrence', async () => {
    const submissionId = 1;
    const repo = sinon.stub(OccurrenceRepository.prototype, 'getOccurrenceSubmission').resolves({
      occurrence_submission_id: 1,
      survey_id: 1,
      template_methodology_species_id: 1,
      source: '',
      input_key: '',
      input_file_name: '',
      output_key: '',
      output_file_name: ''
    });
    const dbConnection = getMockDBConnection();
    const service = new OccurrenceService(dbConnection);
    const response = await service.getOccurrenceSubmission(submissionId);

    expect(repo).to.be.calledOnce;
    expect(response?.occurrence_submission_id).to.be.eql(submissionId);
  });

  describe('scrapeAndUploadOccurrences', () => {
    it('should run without error', async () => {
      const service = mockService();
      const data: PostOccurrence = {
        associatedTaxa: '',
        lifeStage: '',
        sex: '',
        data: {},
        verbatimCoordinates: '',
        individualCount: 1,
        vernacularName: '',
        organismQuantity: '',
        organismQuantityType: '',
        eventDate: ''
      };
      sinon.stub(service, 'scrapeArchiveForOccurrences').returns([data, data]);
      const insertMany = sinon.stub(service, 'insertPostOccurrences').resolves();
      await service.scrapeAndUploadOccurrences(1, new DWCArchive(new ArchiveFile('', '', Buffer.from([]), [])));
      expect(insertMany).to.be.calledOnce;
    });

    it('should throw Failed to Update Occurrence error', async () => {
      const service = mockService();
      const data: PostOccurrence = {
        associatedTaxa: '',
        lifeStage: '',
        sex: '',
        data: {},
        verbatimCoordinates: '',
        individualCount: 1,
        vernacularName: '',
        organismQuantity: '',
        organismQuantityType: '',
        eventDate: ''
      };
      sinon.stub(service, 'scrapeArchiveForOccurrences').returns([data, data]);
      sinon.stub(service, 'insertPostOccurrences').throws(new HTTP400('Failed to insert occurrence data'));

      try {
        await service.scrapeAndUploadOccurrences(1, new DWCArchive(new ArchiveFile('', '', Buffer.from([]), [])));
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION
        );
      }
    });
  });

  describe('insertPostOccurrences', () => {
    it('should run without issue', async () => {
      const service = mockService();
      const insert = sinon.stub(OccurrenceRepository.prototype, 'insertPostOccurrences').resolves();
      const data: PostOccurrence = {
        associatedTaxa: '',
        lifeStage: '',
        sex: '',
        data: {},
        verbatimCoordinates: '',
        individualCount: 1,
        vernacularName: '',
        organismQuantity: '',
        organismQuantityType: '',
        eventDate: ''
      };
      await service.insertPostOccurrences(1, [data, data]);
      expect(insert).to.be.calledTwice;
    });
  });

  describe('insertPostOccurrence', () => {
    it('should run without issue', async () => {
      const service = mockService();
      const insert = sinon.stub(OccurrenceRepository.prototype, 'insertPostOccurrences').resolves();
      const data: PostOccurrence = {
        associatedTaxa: '',
        lifeStage: '',
        sex: '',
        data: {},
        verbatimCoordinates: '',
        individualCount: 1,
        vernacularName: '',
        organismQuantity: '',
        organismQuantityType: '',
        eventDate: ''
      };
      await service.insertPostOccurrence(1, data);
      expect(insert).to.be.called;
    });
  });

  describe('updateSurveyOccurrenceSubmission', () => {
    it('should return a submission id', async () => {
      const service = mockService();
      sinon.stub(OccurrenceRepository.prototype, 'updateSurveyOccurrenceSubmissionWithOutputKey').resolves({});

      const result = await service.updateSurveyOccurrenceSubmission(1, 'file name', 'key');
      expect(result).to.be.eql({});
    });
  });

  describe('updateDWCSourceForOccurrenceSubmission', () => {
    it('should return a submission id', async () => {
      const service = mockService();
      sinon.stub(OccurrenceRepository.prototype, 'updateDWCSourceForOccurrenceSubmission').resolves(1);

      const id = await service.updateDWCSourceForOccurrenceSubmission(1, '{}');
      expect(id).to.be.eql(1);
    });
  });

  describe('getHeadersAndRowsFromDWCArchive', () => {
    it('should run without issue', async () => {
      const service = mockService();

      const data: DWCArchive = ({
        worksheets: {
          event: ({
            name: 'name',
            getHeaders: () => {
              return ['id', 'eventDate', 'verbatimCoordinates'];
            },
            getRows: () => {
              return [
                ['row11', 'row12'],
                ['row21', 'row22']
              ];
            }
          } as unknown) as CSVWorksheet,
          occurrence: ({
            getHeaders: () => {
              return [
                'id',
                'associatedTaxa',
                'lifeStage',
                'sex',
                'individualCount',
                'organismQuantity',
                'organismQuantityType'
              ];
            },
            getRows: () => {
              return [
                ['row11', 'row12'],
                ['row21', 'row22']
              ];
            }
          } as unknown) as CSVWorksheet,
          taxon: ({
            getHeaders: () => {
              return ['id', 'vernacularName'];
            },
            getRows: () => {
              return [
                ['row11', 'row12'],
                ['row21', 'row22']
              ];
            }
          } as unknown) as CSVWorksheet
        }
      } as unknown) as DWCArchive;

      const expectedResponse = {
        occurrenceRows: [
          ['row11', 'row12'],
          ['row21', 'row22']
        ],
        occurrenceIdHeader: 0,
        associatedTaxaHeader: 1,
        eventRows: [
          ['row11', 'row12'],
          ['row21', 'row22']
        ],
        lifeStageHeader: 2,
        sexHeader: 3,
        individualCountHeader: 4,
        organismQuantityHeader: 5,
        organismQuantityTypeHeader: 6,
        occurrenceHeaders: [
          'id',
          'associatedTaxa',
          'lifeStage',
          'sex',
          'individualCount',
          'organismQuantity',
          'organismQuantityType'
        ],
        eventIdHeader: 0,
        eventDateHeader: 1,
        eventVerbatimCoordinatesHeader: 2,
        taxonRows: [
          ['row11', 'row12'],
          ['row21', 'row22']
        ],
        taxonIdHeader: 0,
        vernacularNameHeader: 1
      };

      const response = await service.getHeadersAndRowsFromDWCArchive(data);

      expect(response).to.eql(expectedResponse);
    });
  });

  describe('scrapeArchiveForOccurrences', () => {
    it('should run with no data', async () => {
      const service = mockService();

      const data = {
        occurrenceRows: []
      };

      sinon.stub(OccurrenceService.prototype, 'getHeadersAndRowsFromDWCArchive').returns(data);

      const response = await service.scrapeArchiveForOccurrences(({ id: 1 } as unknown) as DWCArchive);

      expect(response).to.eql([]);
    });

    it('should run with data', async () => {
      const service = mockService();

      const data = {
        occurrenceRows: [['row1', 'row2', 'row3', 'row4', 'row5', 'row6', 'row7']],
        occurrenceIdHeader: 0,
        associatedTaxaHeader: 1,
        eventRows: [['row1', 'row2', 'row3']],
        lifeStageHeader: 2,
        sexHeader: 3,
        individualCountHeader: 4,
        organismQuantityHeader: 5,
        organismQuantityTypeHeader: 6,
        occurrenceHeaders: [
          'id',
          'associatedTaxa',
          'lifeStage',
          'sex',
          'individualCount',
          'organismQuantity',
          'organismQuantityType'
        ],
        eventIdHeader: 0,
        eventDateHeader: 1,
        eventVerbatimCoordinatesHeader: 2,
        taxonRows: [['row1', 'row2', 'row3']],
        taxonIdHeader: 0,
        vernacularNameHeader: 1
      };

      sinon.stub(OccurrenceService.prototype, 'getHeadersAndRowsFromDWCArchive').returns(data);

      const expectedResponse = new PostOccurrence({
        associatedTaxa: 'row2',
        lifeStage: 'row3',
        sex: 'row4',
        individualCount: 'row5',
        vernacularName: 'row2',
        data: {
          headers: [
            'id',
            'associatedTaxa',
            'lifeStage',
            'sex',
            'individualCount',
            'organismQuantity',
            'organismQuantityType'
          ],
          rows: ['row1', 'row2', 'row3', 'row4', 'row5', 'row6', 'row7']
        },
        verbatimCoordinates: 'row3',
        organismQuantity: 'row6',
        organismQuantityType: 'row7',
        eventDate: 'row2'
      });

      const response = await service.scrapeArchiveForOccurrences(({ id: 1 } as unknown) as DWCArchive);

      expect(response).to.eql([expectedResponse]);
    });
  });
});
