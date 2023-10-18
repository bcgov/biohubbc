import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
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
          main_body1: 'This is a message from the Species Inventory Management System (((env))) ((url)).',
          main_body2: 'Your request to become an ((request_type)) was received on ((request_date)).',
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
          main_body1: 'This is a message from the Species Inventory Management System (((env))) ((url)).',
          main_body2: 'Your request to become an ((request_type)) was received on ((request_date)).',
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
