import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from "../constants/status";

export class MessageError extends Error {
  type: SUBMISSION_MESSAGE_TYPE
  description: string

  constructor(type: SUBMISSION_MESSAGE_TYPE, description: string) {
    super(type);
    this.type = type
    this.description = description
  }
}

export class SubmissionError extends Error {
  status: SUBMISSION_STATUS_TYPE
  submissionMessages: MessageError[]

  constructor(status: SUBMISSION_STATUS_TYPE, messages: MessageError[]) {
    super(status);
    this.status = status;
    this.submissionMessages = messages;
  }
}