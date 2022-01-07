import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/custom-error';
import { GCNotifyService } from './gcnotify-service';
import axios from 'axios';
import { IgcNotifyGenericMessage, IgcNotifyConfig } from '../models/gcnotify';

chai.use(sinonChai);

describe('GCNotifyService', () => {
  describe('sendEmailGCNotification', () => {
    afterEach(() => {
      sinon.restore();
    });

    const emailAddress = 'test@email.com';

    const config = {
      headers: {
        Authorization: 'api_key',
        'Content-Type': 'application/json'
      }
    };

    const message = {
      header: 'message.header',
      body1: 'message.body1',
      body2: 'message.body2',
      footer: 'message.footer'
    };

    it('should throw a 400 error when no url is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendEmailGCNotification('', config, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no config is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendEmailGCNotification(emailAddress, {} as IgcNotifyConfig, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no data is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendEmailGCNotification(emailAddress, config, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should not throw an error on success', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: 201 });

      const result = await gcNotifyServiece.sendEmailGCNotification(
        emailAddress,
        config,
        {} as IgcNotifyGenericMessage
      );

      expect(result).to.eql(201);
    });
  });

  describe('sendPhoneNumberGCNotification', () => {
    afterEach(() => {
      sinon.restore();
    });

    const sms = '2501231234';

    const config = {
      headers: {
        Authorization: 'api_key',
        'Content-Type': 'application/json'
      }
    };

    const message = {
      header: 'message.header',
      body1: 'message.body1',
      body2: 'message.body2',
      footer: 'message.footer'
    };

    it('should throw a 400 error when no url is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendPhoneNumberGCNotification('', config, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no config is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendPhoneNumberGCNotification(sms, {} as IgcNotifyConfig, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no data is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendPhoneNumberGCNotification(sms, config, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should not throw an error on success', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: 201 });

      const result = await gcNotifyServiece.sendPhoneNumberGCNotification(sms, config, {} as IgcNotifyGenericMessage);

      expect(result).to.eql(201);
    });
  });
});
