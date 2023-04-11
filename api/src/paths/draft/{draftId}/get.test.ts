import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { ProjectService } from '../../../services/project-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as get from './get';

chai.use(sinonChai);

describe('getRules', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const expectedError = new Error('cannot process request');
    sinon.stub(ProjectService.prototype, 'getSingleDraft').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {}
    } as any;

    try {
      const result = get.getSingleDraft();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid data', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {}
    } as any;

    const getSingleDraftStub = sinon.stub(ProjectService.prototype, 'getSingleDraft').resolves({
      id: 1,
      name: 'string',
      data: { any: 1 }
    });

    const expectedResponse = {
      id: 1,
      name: 'string',
      data: { any: 1 }
    };

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

    const result = get.getSingleDraft();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(getSingleDraftStub).to.be.calledOnce;
  });

  it('should throw a 400 error when there is no draftObject', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = { draftId: '1' };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(ProjectService.prototype, 'getSingleDraft').rejects;

    try {
      const requestHandler = get.getSingleDraft();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get draft');
    }
  });
});
