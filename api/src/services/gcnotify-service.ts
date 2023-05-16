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
  main_body1: string;
  main_body2: string;
  footer: string;
}

export interface IgcNotifyRequestRemovalMessage {
  subject: string;
  header: string;
  date: string;
  file_name: string;
  link: string;
  description: string;
  full_name: string;
  email: string;
  phone: string;
}
export interface ISendGCNotifyEmailMessage {
  email_address: string;
  template_id: string;
  personalisation: IgcNotifyGenericMessage | IgcNotifyRequestRemovalMessage;
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
//TODO: ENV var not catching
const REQUEST_REMOVAL_TEMPLATE =
  process.env.GCNOTIFY_REQUEST_REMOVAL_TEMPLATE || 'c973da33-1f2b-435a-9429-d8ab4fd273c5';
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

/**
 * Service for interacting with GC Notify.
 *
 * GC Notify is a federal government of Canada hosted email/text notification service for government services.
 *
 * @export
 * @class GCNotifyService
 */
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
        main_body1: message.main_body1,
        main_body2: message.main_body2,
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
   * Send Email Notification to a recipient for requesting removal of a file.
   *
   * @param {string} emailAddress
   * @param {IgcNotifyRequestRemovalMessage} message
   * @return {*}  {Promise<IgcNotifyPostReturn>}
   * @memberof GCNotifyService
   */
  async requestRemovalEmailNotification(
    emailAddress: string,
    message: IgcNotifyRequestRemovalMessage
  ): Promise<IgcNotifyPostReturn> {
    const data: ISendGCNotifyEmailMessage = {
      email_address: emailAddress,
      template_id: REQUEST_REMOVAL_TEMPLATE,
      personalisation: {
        subject: message.subject,
        header: message.header,
        date: message.date,
        file_name: message.file_name,
        link: message.link,
        description: message.description,
        full_name: message.full_name,
        email: message.email,
        phone: message.phone
      }
    };
    console.log('REQUEST_REMOVAL_TEMPLATE', REQUEST_REMOVAL_TEMPLATE);
    console.log('process.env', process.env);

    console.log('data', data);
    console.log('EMAIL_URL', EMAIL_URL);
    console.log('config', config);

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
        main_body1: message.main_body1,
        main_body2: message.main_body2,
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
