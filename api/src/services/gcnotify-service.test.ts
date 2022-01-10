import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/custom-error';
import { GCNotifyService } from './gcnotify-service';
import axios from 'axios';
import { IgcNotifyGenericMessage } from '../models/gcnotify';

chai.use(sinonChai);

describe('GCNotifyService', () => {
  describe('sendEmailGCNotification', () => {
    afterEach(() => {
      sinon.restore();
    });

    const emailAddress = 'test@email.com';

    const message = {
      header: 'message.header',
      body1: 'message.body1',
      body2: 'message.body2',
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

  describe('sendPhoneNumberGCNotification', () => {
    afterEach(() => {
      sinon.restore();
    });

    const sms = '2501231234';

    const message = {
      header: 'message.header',
      body1: 'message.body1',
      body2: 'message.body2',
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
