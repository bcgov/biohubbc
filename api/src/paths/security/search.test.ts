import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { SecuritySearchService } from '../../services/security-search-service';
import { getMockDBConnection } from '../../__mocks__/db';
import * as search from './search';

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
    sinon.stub(SecuritySearchService.prototype, 'getPersecutionSecurityFromIds').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: { security_ids: [1] },
      params: {}
    } as any;

    try {
      const result = search.searchRules();

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
      body: { security_ids: [1] },
      params: {}
    } as any;

    const getPersecutionSecurityRulesStub = sinon
      .stub(SecuritySearchService.prototype, 'getPersecutionSecurityFromIds')
      .resolves([1]);

    const expectedResponse = [1];

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

    const result = search.searchRules();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(getPersecutionSecurityRulesStub).to.be.calledOnce;
  });
});
