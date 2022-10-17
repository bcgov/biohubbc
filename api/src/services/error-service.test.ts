import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { ErrorRepository } from '../repositories/error-repository';
import { SubmissionError } from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';
import { ErrorService } from './error-service';

chai.use(sinonChai);

describe('ErrorService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertSubmissionStatus', () => {
    it('should return submission_id and submission_status_type_id on insert', async () => {
      const mockDBConnection = getMockDBConnection();
      const errorService = new ErrorService(mockDBConnection);

      const repo = sinon
        .stub(ErrorRepository.prototype, 'insertSubmissionStatus')
        .resolves({ submission_status_id: 1, submission_status_type_id: 1 });

      const response = await errorService.insertSubmissionStatus(1, SUBMISSION_STATUS_TYPE.DARWIN_CORE_VALIDATED);

      expect(repo).to.be.calledOnce;
      expect(response).to.be.eql({ submission_status_id: 1, submission_status_type_id: 1 });
    });
  });

  describe('insertSubmissionMessage', () => {
    it('should return submission message id and submission_message_type_id', async () => {
      const mockDBConnection = getMockDBConnection();
      const errorService = new ErrorService(mockDBConnection);

      const repo = sinon
        .stub(ErrorRepository.prototype, 'insertSubmissionMessage')
        .resolves({ submission_message_id: 1, submission_message_type_id: 1 });

      const response = await errorService.insertSubmissionMessage(
        1,
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE,
        'some message'
      );

      expect(repo).to.be.calledOnce;
      expect(response).to.be.eql({ submission_message_id: 1, submission_message_type_id: 1 });
    });
  });

  describe('insertSubmissionStatusAndMessage', () => {
    it('should return submission status id and message id', async () => {
      const mockDBConnection = getMockDBConnection();
      const errorService = new ErrorService(mockDBConnection);

      const mockMessageResponse = { submission_message_id: 1, submission_message_type_id: 1 };
      const mockStatusResponse = { submission_status_id: 2, submission_status_type_id: 2 };

      const repoStatus = sinon.stub(ErrorRepository.prototype, 'insertSubmissionStatus').resolves(mockStatusResponse);

      const repoMessage = sinon
        .stub(ErrorRepository.prototype, 'insertSubmissionMessage')
        .resolves(mockMessageResponse);

      const response = await errorService.insertSubmissionStatusAndMessage(
        1,
        SUBMISSION_STATUS_TYPE.FAILED_VALIDATION,
        SUBMISSION_MESSAGE_TYPE.FAILED_PARSE_SUBMISSION,
        'message'
      );
      expect(repoStatus).to.be.calledOnce;
      expect(repoMessage).to.be.calledOnce;
      expect(response).to.be.eql({
        submission_status_id: 2,
        submission_message_id: 1
      });
    });
  });

  describe('insertSubmissionError', () => {
    it('should insert a submission status id and an array of submission messages', async () => {
      const mockDBConnection = getMockDBConnection();
      const errorService = new ErrorService(mockDBConnection);

      const mockMessageResponse = { submission_message_id: 1, submission_message_type_id: 1 };
      const mockStatusResponse = { submission_status_id: 2, submission_status_type_id: 2 };

      const repoStatusStub = sinon
        .stub(ErrorRepository.prototype, 'insertSubmissionStatus')
        .resolves(mockStatusResponse);

      const repoMessageStub = sinon
        .stub(ErrorRepository.prototype, 'insertSubmissionMessage')
        .resolves(mockMessageResponse);

      const submissionError = {
        status: SUBMISSION_STATUS_TYPE.INVALID_MEDIA,
        submissionMessages: [
          {
            type: SUBMISSION_MESSAGE_TYPE.FAILED_PARSE_SUBMISSION,
            description: 'there is a problem in row 10',
            errorCode: 'some error code'
          }
        ]
      };

      await errorService.insertSubmissionError(1, submissionError as SubmissionError);

      expect(repoStatusStub).to.be.calledOnce;
      expect(repoMessageStub).to.be.calledOnce;
      expect(repoMessageStub).to.have.been.calledWith(
        mockStatusResponse.submission_status_id,
        submissionError.submissionMessages[0].type,
        submissionError.submissionMessages[0].description
      );
    });
  });
});
