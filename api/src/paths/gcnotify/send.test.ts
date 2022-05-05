import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTPError } from '../../errors/custom-error';
import { getRequestHandlerMocks } from '../../__mocks__/db';
import * as notify from './send';

chai.use(sinonChai);

describe('gcnotify', () => {
  describe('sendNotification', () => {
    const env = Object.assign({}, process.env);
    afterEach(() => {
      sinon.restore();
      process.env = env;
    });

    const sampleReq = {
      params: {
        userId: '1'
      },
      body: {
        recipient: { emailAddress: 'test@email.com', phoneNumber: null, userId: null },
        message: {
          header: 'Hello TEST,',
          body1: 'This is a message from the Species Inventory Management System (((env))) ((url)).',
          body2: 'Your request to become an ((request_type)) was received on ((request_date)).',
          footer: 'We will contact you after your request has been reviewed by a member of our team.'
        }
      }
    } as any;

    const sampleRes = {
      data: {
        content: { item: 'object' },
        id: 'string',
        reference: 'string',
        scheduled_for: 'string',
        template: { item: 'object' },
        uri: 'string'
      }
    };

    it('should throw a 400 error when no req body', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = sampleReq.params;
      mockReq.body = null;

      try {
        const requestHandler = notify.sendNotification();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required param: body');
      }
    });

    it('should throw a 400 error when no recipient', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = sampleReq.params;
      mockReq.body = { ...sampleReq.body, recipient: null };

      try {
        const requestHandler = notify.sendNotification();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: recipient');
      }
    });

    it('should throw a 400 error when no message', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = sampleReq.params;
      mockReq.body = { ...sampleReq.body, message: null };

      try {
        const requestHandler = notify.sendNotification();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: message');
      }
    });

    it('should throw a 400 error when no message.header', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = sampleReq.params;
      mockReq.body = { ...sampleReq.body, message: { ...sampleReq.body.message, header: null } };

      try {
        const requestHandler = notify.sendNotification();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: message.header');
      }
    });

    it('should throw a 400 error when no message.body1', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = sampleReq.params;
      mockReq.body = { ...sampleReq.body, message: { ...sampleReq.body.message, body1: null } };

      try {
        const requestHandler = notify.sendNotification();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: message.body1');
      }
    });

    it('should throw a 400 error when no message.body2', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = sampleReq.params;
      mockReq.body = { ...sampleReq.body, message: { ...sampleReq.body.message, body2: null } };

      try {
        const requestHandler = notify.sendNotification();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: message.body2');
      }
    });

    it('should throw a 400 error when no message.footer', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = sampleReq.params;
      mockReq.body = { ...sampleReq.body, message: { ...sampleReq.body.message, footer: null } };

      try {
        const requestHandler = notify.sendNotification();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: message.footer');
      }
    });

    it('sends email notification and returns 200 on success', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = sampleReq.params;
      mockReq.body = sampleReq.body;
      process.env.GCNOTIFY_SECRET_API_KEY = 'temp';

      const sendEmailGCNotification = sinon.stub(axios, 'post').resolves(sampleRes);

      const requestHandler = notify.sendNotification();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(sendEmailGCNotification).to.have.been.calledOnce;
      expect(mockRes.statusValue).to.equal(200);
    });

    it('sends sms notification and returns 200 on success', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = sampleReq.params;
      mockReq.body = {
        recipient: { emailAddress: null, phoneNumber: 2501231231, userId: null },
        message: {
          header: 'Hello TEST,',
          body1: 'This is a message from the Species Inventory Management System (((env))) ((url)).',
          body2: 'Your request to become an ((request_type)) was received on ((request_date)).',
          footer: 'We will contact you after your request has been reviewed by a member of our team.'
        }
      };
      process.env.GCNOTIFY_SECRET_API_KEY = 'temp';

      const sendPhoneNumberGCNotification = sinon.stub(axios, 'post').resolves(sampleRes);

      const requestHandler = notify.sendNotification();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(sendPhoneNumberGCNotification).to.have.been.calledOnce;
      expect(mockRes.statusValue).to.equal(200);
    });
  });
});
