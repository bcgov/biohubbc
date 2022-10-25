import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE, SUMMARY_SUBMISSION_MESSAGE_TYPE } from '../constants/status';

export const SubmissionErrorFromMessageType = (type: SUBMISSION_MESSAGE_TYPE): SubmissionError => {
  const message = new MessageError(type);
  return new SubmissionError({ messages: [message] });
};

export const SummarySubmissionErrorFromMessageType = (type: SUMMARY_SUBMISSION_MESSAGE_TYPE): SummarySubmissionError => {
  const message = new MessageError<SUMMARY_SUBMISSION_MESSAGE_TYPE>(type);
  return new SummarySubmissionError({ messages: [message] });
};

export class MessageError<T extends string = SUBMISSION_MESSAGE_TYPE> extends Error {
  type: T;
  description: string;
  errorCode: string;

  constructor(type: T, description?: string, errorCode?: string) {
    super(type);
    this.type = type;
    this.description = type;
    this.errorCode = type;

    if (description) {
      this.description = description;
    }

    if (errorCode) {
      this.errorCode = errorCode;
    }
  }
}

export class SubmissionError extends Error {
  status: SUBMISSION_STATUS_TYPE;
  submissionMessages: MessageError[];

  constructor(params: { status?: SUBMISSION_STATUS_TYPE; messages?: MessageError[] }) {
    const { status, messages } = params;
    super(status || SUBMISSION_STATUS_TYPE.REJECTED);

    this.status = status || SUBMISSION_STATUS_TYPE.REJECTED;
    this.submissionMessages = messages || [];
  }

  setStatus(status: SUBMISSION_STATUS_TYPE) {
    this.status = status;
  }
}

export class SummarySubmissionError extends Error {
  summarySubmissionMessages: MessageError<SUMMARY_SUBMISSION_MESSAGE_TYPE>[];

  constructor(params: { messages?: MessageError<SUMMARY_SUBMISSION_MESSAGE_TYPE>[] }) {
    super(SUBMISSION_MESSAGE_TYPE.FAILED_PARSE_SUBMISSION);
    const { messages } = params;

    this.summarySubmissionMessages = messages || [];
  }
}
