import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/custom-error';
import { GCNotifyService } from './gcnotify-service';
import axios from 'axios';
import { IgcNotfiyGenericMessage } from '../models/gcnotify';

chai.use(sinonChai);

describe('GCNotifyService', () => {
  describe('sendGCNotification', () => {
    afterEach(() => {
      sinon.restore();
    });

    const url = 'url';

    const config = {
      headers: {
        Authorization: 'api_key',
        'Content-Type': 'application/json'
      }
    };

    const data = {
      email_address: 'emailAddress',
      template_id: 'template',
      personalisation: {
        header: 'message.header',
        main_body1: 'message.body1',
        main_body2: 'message.body2',
        footer: 'message.footer'
      }
    };

    it('should throw a 400 error when no url is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendGCNotification('', config, data);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no config is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendGCNotification(url, {}, data);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no data is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendGCNotification(url, config, {});
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should not throw an error on success', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: 201 });

      const result = await gcNotifyServiece.sendGCNotification(url, config, data);

      expect(result).to.eql(201);
    });
  });

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
        await gcNotifyServiece.sendEmailGCNotification(emailAddress, {}, message);
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
        {} as IgcNotfiyGenericMessage
      );

      expect(result).to.eql(201);
    });
  });

  describe('sendSmsGCNotification', () => {
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
        await gcNotifyServiece.sendSmsGCNotification('', config, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no config is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendSmsGCNotification(sms, {}, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should throw a 400 error when no data is given', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: null });

      try {
        await gcNotifyServiece.sendSmsGCNotification(sms, config, message);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to send Notification');
      }
    });

    it('should not throw an error on success', async () => {
      const gcNotifyServiece = new GCNotifyService();

      sinon.stub(axios, 'post').resolves({ data: 201 });

      const result = await gcNotifyServiece.sendSmsGCNotification(sms, config, {} as IgcNotfiyGenericMessage);

      expect(result).to.eql(201);
    });
  });
});
