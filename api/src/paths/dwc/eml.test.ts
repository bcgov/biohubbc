import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { EmlService } from '../../services/eml-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { getProjectEml } from './eml';

chai.use(sinonChai);

describe('getProjectEml', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = { projectId: undefined };

    try {
      await getProjectEml()(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get project objectives data');
    }
  });

  it('should throw an error when buildProjectEml fails', async () => {
    const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(EmlService.prototype, 'buildProjectEml').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1'
    };

    try {
      const requestHandler = getProjectEml();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.rollback).to.have.been.called;
      expect(dbConnectionObj.release).to.have.been.called;
      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('should succeed with valid params', async () => {
    const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const buildProjectEmlStub = sinon.stub(EmlService.prototype, 'buildProjectEml').resolves('string');

    const { mockReq, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      projectId: '1',
      surveyId: ['1']
    };

    let actualResult: any = null;
    const sampleRes = {
      status: () => {
        return {
          json: (response: any) => {
            actualResult = response;
          }
        };
      },
      setHeader: (a: any, b: any) => {
        return { a: a, b: b };
      },
      attachment: (a: any) => {
        return { a: a };
      },
      contentType: (a: any) => {
        return { a: a };
      }
    };

    const requestHandler = getProjectEml();
    await requestHandler(mockReq, (sampleRes as unknown) as any, mockNext);
    expect(actualResult).to.eql({ eml: 'string' });
    expect(buildProjectEmlStub).to.have.been.called;
  });
});
