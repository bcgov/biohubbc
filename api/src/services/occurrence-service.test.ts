import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { HTTP400 } from '../errors/http-error';
import { PostOccurrence } from '../models/occurrence-create';
import { OccurrenceRepository } from '../repositories/occurrence-repository';
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

  describe('Get Headers and Rows From DWC Archive', () => {
    it('should return valid information', () => {
      const service = mockService();
      const dwc = new DWCArchive(new ArchiveFile('test', 'zip', Buffer.from([]), []));
      sinon.stub(dwc, 'worksheets').value({
        event: {
          getHeaders: () => {
            return ['id', 'verbatimCoordinates', 'eventDate'];
          },
          getRows: () => []
        },
        occurrence: {
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
          getRows: () => []
        },
        taxon: {
          getHeaders: () => {
            return ['id', 'vernacularName'];
          },
          getRows: () => []
        }
      });
      const data = service.getHeadersAndRowsFromDWCArchive(dwc);
      expect(data).to.have.keys([
        'occurrenceRows',
        'occurrenceIdHeader',
        'associatedTaxaHeader',
        'eventRows',
        'lifeStageHeader',
        'sexHeader',
        'individualCountHeader',
        'organismQuantityHeader',
        'organismQuantityTypeHeader',
        'occurrenceHeaders',
        'eventIdHeader',
        'eventDateHeader',
        'eventVerbatimCoordinatesHeader',
        'taxonRows',
        'taxonIdHeader',
        'vernacularNameHeader'
      ]);

      expect(data['eventIdHeader']).to.be.eql(0);
      expect(data['eventVerbatimCoordinatesHeader']).to.be.eql(1);
      expect(data['eventDateHeader']).to.be.eql(2);
      expect(data['occurrenceIdHeader']).to.be.eql(0);
      expect(data['associatedTaxaHeader']).to.be.eql(1);
      expect(data['lifeStageHeader']).to.be.eql(2);
      expect(data['sexHeader']).to.be.eql(3);
      expect(data['individualCountHeader']).to.be.eql(4);
      expect(data['organismQuantityHeader']).to.be.eql(5);
      expect(data['organismQuantityTypeHeader']).to.be.eql(6);
      expect(data['taxonIdHeader']).to.be.eql(0);
      expect(data['vernacularNameHeader']).to.be.eql(1);
    });

    it('should return object with undefined values', () => {
      const service = mockService();
      const dwc = new DWCArchive(new ArchiveFile('test', 'zip', Buffer.from([]), []));
      const data = service.getHeadersAndRowsFromDWCArchive(dwc);
      expect(data).to.have.keys([
        'occurrenceRows',
        'occurrenceIdHeader',
        'associatedTaxaHeader',
        'eventRows',
        'lifeStageHeader',
        'sexHeader',
        'individualCountHeader',
        'organismQuantityHeader',
        'organismQuantityTypeHeader',
        'occurrenceHeaders',
        'eventIdHeader',
        'eventDateHeader',
        'eventVerbatimCoordinatesHeader',
        'taxonRows',
        'taxonIdHeader',
        'vernacularNameHeader'
      ]);
      expect(data['occurrenceRows']).to.be.undefined;
      expect(data['occurrenceIdHeader']).to.be.undefined;
      expect(data['associatedTaxaHeader']).to.be.undefined;
      expect(data['eventRows']).to.be.undefined;
      expect(data['lifeStageHeader']).to.be.undefined;
      expect(data['sexHeader']).to.be.undefined;
      expect(data['individualCountHeader']).to.be.undefined;
      expect(data['organismQuantityHeader']).to.be.undefined;
      expect(data['organismQuantityTypeHeader']).to.be.undefined;
      expect(data['occurrenceHeaders']).to.be.undefined;
      expect(data['eventIdHeader']).to.be.undefined;
      expect(data['eventDateHeader']).to.be.undefined;
      expect(data['eventVerbatimCoordinatesHeader']).to.be.undefined;
      expect(data['taxonRows']).to.be.undefined;
      expect(data['taxonIdHeader']).to.be.undefined;
      expect(data['vernacularNameHeader']).to.be.undefined;
    });
  });

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
        expect(error instanceof SubmissionError).to.be.true;
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
});
