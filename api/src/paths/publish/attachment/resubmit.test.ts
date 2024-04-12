import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { GCNotifyService } from '../../../services/gcnotify-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import { POST, resubmitAttachment } from './resubmit';

chai.use(sinonChai);

describe('resubmit', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((POST.apiDoc as unknown) as object)).to.be.true;
    });
  });

  describe('resubmitAttachment', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('submits selected data to biohub', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(GCNotifyService.prototype, 'sendNotificationForResubmit').resolves(true);

      const sampleReq = {
        keycloak_token: {},
        body: {
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
        },
        params: {}
      } as any;

      let actualResult: any = null;
      const sampleRes = {
        status: () => {
          return {
            json: (response: any) => {
              actualResult = response;
            }
          };
        }
      };

      const { mockNext } = getRequestHandlerMocks();

      const requestHandler = resubmitAttachment();

      await requestHandler(sampleReq, (sampleRes as unknown) as any, mockNext);

      expect(actualResult).to.eql(true);
    });

    it('catches error, calls rollback, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      const sampleReq = {
        keycloak_token: {},
        body: {
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
        },
        params: {}
      } as any;

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(GCNotifyService.prototype, 'sendNotificationForResubmit').rejects(new Error('a test error'));

      const { mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = resubmitAttachment();

        await requestHandler(sampleReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.rollback).to.have.been.called;
        expect(dbConnectionObj.release).to.have.been.called;

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
