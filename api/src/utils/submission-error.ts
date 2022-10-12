import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';

export const SubmissionErrorFromMessageType = (type: SUBMISSION_MESSAGE_TYPE): SubmissionError => {
  const message = new MessageError(type);
  return new SubmissionError({ messages: [message] });
};
export class MessageError extends Error {
  type: SUBMISSION_MESSAGE_TYPE;
  description: string;
  errorCode: string;

  constructor(type: SUBMISSION_MESSAGE_TYPE, description?: string, errorCode?: string) {
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
