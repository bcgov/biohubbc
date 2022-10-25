import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { ErrorRepository } from '../repositories/error-repository';
import { getLogger } from '../utils/logger';
import { SubmissionError, SummarySubmissionError } from '../utils/submission-error';
import { DBService } from './db-service';

const defaultLog = getLogger('services/error-service');

export class ErrorService extends DBService {
  errorRepository: ErrorRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.errorRepository = new ErrorRepository(connection);
  }

  /**
   * Inserts both the status and message of a submission
   *
   * @param {number} submissionId
   * @param {SUBMISSION_STATUS_TYPE} submissionStatusType
   * @param {SUBMISSION_MESSAGE_TYPE} submissionMessageType
   * @param {string} submissionMessage
   * @return {*}  {Promise<{
   *     submission_status_id: number;
   *     submission_message_id: number;
   *   }>}
   * @memberof SubmissionService
   */
  async insertSubmissionStatusAndMessage(
    submissionId: number,
    submissionStatusType: SUBMISSION_STATUS_TYPE,
    submissionMessageType: SUBMISSION_MESSAGE_TYPE,
    submissionMessage: string
  ): Promise<{
    submission_status_id: number;
    submission_message_id: number;
  }> {
    const submission_status_id = (await this.errorRepository.insertSubmissionStatus(submissionId, submissionStatusType))
      .submission_status_id;

    const submission_message_id = (
      await this.errorRepository.insertSubmissionMessage(submission_status_id, submissionMessageType, submissionMessage)
    ).submission_message_id;

    return {
      submission_status_id,
      submission_message_id
    };
  }

  /**
   * Insert a submission status record.
   *
   * @param {number} submissionId
   * @param {SUBMISSION_STATUS_TYPE} submissionStatusType
   * @return {*}  {Promise<{
   *     submission_status_id: number;
   *     submission_status_type_id: number;
   *   }>}
   * @memberof SubmissionService
   */
  async insertSubmissionStatus(
    submissionId: number,
    submissionStatusType: SUBMISSION_STATUS_TYPE
  ): Promise<{
    submission_status_id: number;
    submission_status_type_id: number;
  }> {
    return this.errorRepository.insertSubmissionStatus(submissionId, submissionStatusType);
  }

  /**
   * Insert a submission m record.
   *
   * @param {number} submissionId
   * @param {SUBMISSION_STATUS_TYPE} submissionStatusType
   * @return {*}  {Promise<{
   *     submission_status_id: number;
   *     submission_status_type_id: number;
   *   }>}
   * @memberof SubmissionService
   */
  async insertSubmissionMessage(
    submissionStatusId: number,
    submissionMessageType: SUBMISSION_MESSAGE_TYPE,
    submissionMessage: string
  ): Promise<{
    submission_message_id: number;
    submission_message_type_id: number;
  }> {
    return this.errorRepository.insertSubmissionMessage(submissionStatusId, submissionMessageType, submissionMessage);
  }

  async insertSubmissionError(submissionId: number, error: SubmissionError) {
    const submission_status_id = (await this.errorRepository.insertSubmissionStatus(submissionId, error.status))
      .submission_status_id;
    const promises = error.submissionMessages.map((message) => {
      return this.errorRepository.insertSubmissionMessage(submission_status_id, message.type, message.description);
    });

    await Promise.all(promises);
  }

  /**
   * done = TRUE
   * @TODO jsdoc - Comment on reason why we call this method in ErrorService instead of SubmissionService (because)
   * summary submissions don't have a notion of status; they either fail with errors or pass valiation).
   * @param summarySubmissionId 
   * @param error 
   */
  async insertSummarySubmissionError(summarySubmissionId: number, error: SummarySubmissionError): Promise<void> {
    defaultLog.debug({ label: 'insertSummarySubmissionError', summarySubmissionId, error });
    const promises = error.summarySubmissionMessages.map((message) => {
      return this.errorRepository.insertSummarySubmissionMessage(summarySubmissionId, message.type, message.description);
    });

    await Promise.all(promises);
    defaultLog.debug({ label: 'insertSummarySubmissionError', done: true });
  }
}
