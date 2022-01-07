import axios from 'axios';
import { ApiError, ApiErrorType } from '../errors/custom-error';
import { IgcNotifyPostReturn, IgcNotifyGenericMessage, IgcNotifyConfig } from '../models/gcnotify';

const EMAIL_TEMPLATE: string = process.env.GCNOTIFY_ONBOARDING_REQUEST_EMAIL_TEMPLATE || '';
const SMS_TEMPLATE: string = process.env.GCNOTIFY_ONBOARDING_REQUEST_SMS_TEMPLATE || '';
const EMAIL_URL = process.env.GCNOTIFY_EMAIL_URL || '';
const SMS_URL = process.env.GCNOTIFY_SMS_URL || '';

export class GCNotifyService {
  /**
   * Send email notification to recipient
   *
   *
   * @param {string} emailAddress
   * @param {IgcNotifyConfig} config
   * @param {IgcNotifyGenericMessage} message
   * @returns {IgcNotifyPostReturn}
   */
  async sendEmailGCNotification(
    emailAddress: string,
    config: IgcNotifyConfig,
    message: IgcNotifyGenericMessage
  ): Promise<IgcNotifyPostReturn> {
    const data = {
      email_address: emailAddress,
      template_id: EMAIL_TEMPLATE,
      personalisation: {
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
   * @param {IgcNotifyConfig} config
   * @param {IgcNotifyGenericMessage} message
   * @returns {IgcNotifyPostReturn}
   */
  async sendPhoneNumberGCNotification(
    sms: string,
    config: IgcNotifyConfig,
    message: IgcNotifyGenericMessage
  ): Promise<IgcNotifyPostReturn> {
    const data = {
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
