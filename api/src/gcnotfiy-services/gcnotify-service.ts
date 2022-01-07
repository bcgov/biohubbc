import axios from 'axios';
import { ApiError, ApiErrorType } from '../errors/custom-error';
import { IgcNotfiyPostReturn, IgcNotfiyGenericMessage } from '../models/gcnotify';

export class GCNotifyService {
  /**
   * Sends api call to gcnotify to send notification
   *
   *
   * @param {string} url
   * @param {object} config
   * @param {object} data
   */
  async sendGCNotification(url: string, config: object, data: object): Promise<IgcNotfiyPostReturn> {
    const response = await axios.post(url, data, config);

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
   * @param {string} emailAddress
   * @param {object} config
   * @param {object} message
   */
  async sendEmailGCNotification(
    emailAddress: string,
    config: object,
    message: IgcNotfiyGenericMessage
  ): Promise<IgcNotfiyPostReturn> {
    const template = process.env.GCNOTIFY_ONBOARDING_REQUEST_EMAIL_TEMPLATE;
    const data = {
      email_address: emailAddress,
      template_id: template,
      personalisation: {
        header: message.header,
        main_body1: message.body1,
        main_body2: message.body2,
        footer: message.footer
      }
    };

    const response = await axios.post('https://api.notification.canada.ca/v2/notifications/email', data, config);

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
   * @param {object} config
   * @param {object} message
   */
  async sendSmsGCNotification(
    sms: string,
    config: object,
    message: IgcNotfiyGenericMessage
  ): Promise<IgcNotfiyPostReturn> {
    const template = process.env.GCNOTIFY_ONBOARDING_REQUEST_SMS_TEMPLATE;
    const data = {
      phone_number: sms,
      template_id: template,
      personalisation: {
        header: message.header,
        main_body1: message.body1,
        main_body2: message.body2,
        footer: message.footer
      }
    };

    const response = await axios.post('https://api.notification.canada.ca/v2/notifications/sms', data, config);

    const result = (response && response.data) || null;

    if (!result) {
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to send Notification');
    }

    return result;
  }
}
