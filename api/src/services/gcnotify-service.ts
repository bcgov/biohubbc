import axios from 'axios';
import { ApiError, ApiErrorType } from '../errors/api-error';

export interface IgcNotifyPostReturn {
  content: object;
  id: string;
  reference: string;
  scheduled_for: string;
  template: object;
  uri: string;
}

export interface IgcNotifyGenericMessage {
  subject: string;
  header: string;
  body1: string;
  body2: string;
  footer: string;
}

export interface ISendGCNotifyEmailMessage {
  email_address: string;
  template_id: string;
  personalisation: {
    subject: string;
    header: string;
    main_body1: string;
    main_body2: string;
    footer: string;
  };
}

export interface ISendGCNotifySMSMessage {
  phone_number: string;
  template_id: string;
  personalisation: {
    header: string;
    main_body1: string;
    main_body2: string;
    footer: string;
  };
}

const EMAIL_TEMPLATE = process.env.GCNOTIFY_ONBOARDING_REQUEST_EMAIL_TEMPLATE || '';
const SMS_TEMPLATE = process.env.GCNOTIFY_ONBOARDING_REQUEST_SMS_TEMPLATE || '';
const EMAIL_URL = process.env.GCNOTIFY_EMAIL_URL || '';
const SMS_URL = process.env.GCNOTIFY_SMS_URL || '';
const API_KEY = process.env.GCNOTIFY_SECRET_API_KEY || '';

const config = {
  headers: {
    Authorization: API_KEY,
    'Content-Type': 'application/json'
  }
};
export class GCNotifyService {
  /**
   * Send email notification to recipient
   *
   *
   * @param {string} emailAddress
   * @param {IgcNotifyGenericMessage} message
   * @returns {IgcNotifyPostReturn}
   */
  async sendEmailGCNotification(emailAddress: string, message: IgcNotifyGenericMessage): Promise<IgcNotifyPostReturn> {
    const data: ISendGCNotifyEmailMessage = {
      email_address: emailAddress,
      template_id: EMAIL_TEMPLATE,
      personalisation: {
        subject: message.subject,
        header: message.header,
        main_body1: message.body1,
        main_body2: message.body2,
        footer: message.footer
      }
    };

    const response = await axios.post(EMAIL_URL, data, config);

    const result = (response && response.data) || null;

    if (!result) {
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to send Notification');
    }

    return result;
  }

  /**
   * Send email notification to recipient
   *
   *
   * @param {string} sms
   * @param {IgcNotifyGenericMessage} message
   * @returns {IgcNotifyPostReturn}
   */
  async sendPhoneNumberGCNotification(sms: string, message: IgcNotifyGenericMessage): Promise<IgcNotifyPostReturn> {
    const data: ISendGCNotifySMSMessage = {
      phone_number: sms,
      template_id: SMS_TEMPLATE,
      personalisation: {
        header: message.header,
        main_body1: message.body1,
        main_body2: message.body2,
        footer: message.footer
      }
    };

    const response = await axios.post(SMS_URL, data, config);

    const result = (response && response.data) || null;

    if (!result) {
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to send Notification');
    }

    return result;
  }
}
