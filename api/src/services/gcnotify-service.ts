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

export interface IgcNotifyRequestRemovalFormValues {
  projectId: number;
  fileName: string;
  parentName: string;
  path: string;
  formValues: {
    full_name: string;
    email_address: string;
    phone_number: string;
    description: string;
  };
}

const EMAIL_TEMPLATE = process.env.GCNOTIFY_ONBOARDING_REQUEST_EMAIL_TEMPLATE || '';
const REQUEST_RESUBMIT_TEMPLATE = process.env.GCNOTIFY_REQUEST_RESUBMIT_TEMPLATE || '';
const SMS_TEMPLATE = process.env.GCNOTIFY_ONBOARDING_REQUEST_SMS_TEMPLATE || '';
const EMAIL_URL = process.env.GCNOTIFY_EMAIL_URL || '';
const SMS_URL = process.env.GCNOTIFY_SMS_URL || '';
const API_KEY = process.env.GCNOTIFY_SECRET_API_KEY || '';
const adminEmail = process.env.GCNOTIFY_ADMIN_EMAIL || '';

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
   * Send Both emails for requesting removal of a file.
   *
   * @param {IgcNotifyRequestRemovalFormValues} resubmitData
   * @return {*}  {Promise<boolean>}
   * @memberof GCNotifyService
   */
  async sendNotificationForResubmit(resubmitData: IgcNotifyRequestRemovalFormValues): Promise<boolean> {
    const url = `${process.env.APP_HOST}/login?redirect=${encodeURIComponent(resubmitData.path)}`;
    const hrefUrl = `[${resubmitData.parentName}](${url})`;

    const message: IgcNotifyRequestRemovalMessage = {
      subject: '',
      header: '',
      date: new Date().toLocaleString(),
      file_name: resubmitData.fileName,
      link: hrefUrl,
      description: resubmitData.formValues.description,
      full_name: resubmitData.formValues.full_name,
      email: resubmitData.formValues.email_address,
      phone: resubmitData.formValues.phone_number
    };

    const submitterMessage: IgcNotifyRequestRemovalMessage = {
      ...message,
      subject: 'Species Inventory Management System - Your Request to Remove or Resubmit Has Been Sent',
      header: `Your request to remove or resubmit data has been sent.

      A BioHub Administrator should be in contact with you shortly to discuss your request.`
    };

    const adminMessage: IgcNotifyRequestRemovalMessage = {
      ...message,
      subject: 'Species Inventory Management System -  Request to Remove or Resubmit',
      header: ''
    };

    const submitterEmailResponse = await this.requestRemovalEmailNotification(
      resubmitData.formValues.email_address,
      submitterMessage
    );
    const adminEmailResponse = await this.requestRemovalEmailNotification(adminEmail, adminMessage);

    if (!submitterEmailResponse || !adminEmailResponse) {
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to send Notification');
    }

    return Boolean(submitterEmailResponse && adminEmailResponse);
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
      template_id: REQUEST_RESUBMIT_TEMPLATE,
      personalisation: { ...message }
    };

    const response = await axios.post(EMAIL_URL, data, config);
    const result = response.data || null;

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
