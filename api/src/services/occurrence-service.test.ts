import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { OccurrenceRepository } from '../repositories/occurrence-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { OccurrenceService } from './occurrence-service';

chai.use(sinonChai);

describe('OccurrenceService', () => {
  afterEach(() => {
    sinon.restore();
  });

  // it('', async () => {
  //   const dbConnection = getMockDBConnection();
  //   const service = new OccurrenceService(dbConnection);
  // });

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

  // it('', async () => {
  //   const dbConnection = getMockDBConnection();
  //   const service = new OccurrenceService(dbConnection);
  // });
});
