import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/api-error';
import { GCNotifyService, IgcNotifyGenericMessage, IgcNotifyRequestRemovalMessage } from './gcnotify-service';

chai.use(sinonChai);

describe('GCNotifyService', () => {
  describe('sendEmailGCNotification', () => {
    afterEach(() => {
      sinon.restore();
    });

    const emailAddress = 'test@email.com';

    const message = {
      subject: 'message.subject',
      header: 'message.header',
      main_body1: 'message.main_body1',
      main_body2: 'message.main_body2',
      footer: 'message.footer'
    };

    it('should throw a 400 error when no email is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendEmailGCNotification('', message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no data is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendEmailGCNotification(emailAddress, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should not throw an error on success', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: 201 });

      const result = await gcNotifyServiece.sendEmailGCNotification(emailAddress, {} as IgcNotifyGenericMessage);

      expect(result).to.eql(201);
    });
  });

  describe('sendNotificationForResubmit', () => {
    afterEach(() => {
      sinon.restore();
    });

    const form = {
      projectId: 1,
      fileName: 'test',
      parentName: 'test',
      formValues: {
        full_name: 'test',
        email_address: 'test',
        phone_number: 'test',
        description: 'test'
      },
      path: 'test'
    };

    it('should throw an error when no gcNotify fails', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(GCNotifyService.prototype, 'requestRemovalEmailNotification').rejects(new Error('a test error'));

      try {
        await gcNotifyServiece.sendNotificationForResubmit(form);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('a test error');
      }
    });

    it('should not throw an error on success', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(GCNotifyService.prototype, 'requestRemovalEmailNotification').resolves({ data: 201 } as any);
      const result = await gcNotifyServiece.sendNotificationForResubmit(form);

      expect(result).to.eql(true);
    });
  });

  describe('requestRemovalEmailNotification', () => {
    afterEach(() => {
      sinon.restore();
    });

    const emailAddress = 'test@email.com';

    const message = {
      subject: 'message.subject',
      header: 'message.header',
      date: 'message.date',
      file_name: 'message.file_name',
      link: 'message.link',
      description: 'message.description',
      full_name: 'message.full_name',
      email: 'message.email',
      phone: 'message.phone'
    } as IgcNotifyRequestRemovalMessage;

    it('should throw a 400 error when no email is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.requestRemovalEmailNotification('', message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no data is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.requestRemovalEmailNotification(emailAddress, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should not throw an error on success', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: 201 });

      const result = await gcNotifyServiece.requestRemovalEmailNotification(
        emailAddress,
        {} as IgcNotifyRequestRemovalMessage
      );

      expect(result).to.eql(201);
    });
  });

  describe('sendPhoneNumberGCNotification', () => {
    afterEach(() => {
      sinon.restore();
    });

    const sms = '2501231234';

    const message = {
      subject: 'message.subject',
      header: 'message.header',
      main_body1: 'message.main_body1',
      main_body2: 'message.main_body2',
      footer: 'message.footer'
    };

    it('should throw a 400 error when no phone number is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendPhoneNumberGCNotification('', message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no data is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendPhoneNumberGCNotification(sms, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should not throw an error on success', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: 201 });

      const result = await gcNotifyServiece.sendPhoneNumberGCNotification(sms, {} as IgcNotifyGenericMessage);

      expect(result).to.eql(201);
    });
  });
});
