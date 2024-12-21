import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { createSamplePeriodRecord } from '.';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('createSamplePeriodRecord', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should successfully create sample periods', async () => {
    const dbConnectionObj = getMockDBConnection({
      open: sinon.stub(),
      release: sinon.stub(),
      commit: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const insertSampleMethodsStub = sinon.stub(SampleMethodService.prototype, 'insertSampleMethods').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
      method_technique_id: 1,
      sample_sites: [
        {
          survey_sample_site_id: 1,
          sample_periods: [
            {
              start_date: '2024-12-01',
              end_date: '2024-12-05'
            }
          ]
        }
      ]
    };

    const requestHandler = createSamplePeriodRecord();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(insertSampleMethodsStub).to.have.been.calledOnceWithExactly([
      {
        survey_sample_site_id: 1,
        method_technique_id: 1,
        sample_periods: [
          {
            start_date: '2024-12-01',
            end_date: '2024-12-05'
          }
        ],
        description: null,
        method_response_metric_id: undefined
      }
    ]);

    expect(mockRes.statusValue).to.equal(201);
    expect(dbConnectionObj.commit).to.have.been.calledOnce;
    expect(dbConnectionObj.release).to.have.been.calledOnce;
    expect(dbConnectionObj.open).to.have.been.calledOnce;
    expect(mockRes.send).to.have.been.calledOnce;
  });

  it('should handle and re-throw errors', async () => {
    const dbConnectionObj = getMockDBConnection({
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockError = new Error('Test Error');

    sinon.stub(SampleMethodService.prototype, 'insertSampleMethods').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
      method_technique_id: 1,
      sample_sites: [
        {
          survey_sample_site_id: 1,
          sample_periods: [
            {
              start_date: '2024-12-01',
              end_date: '2024-12-05'
            }
          ]
        }
      ]
    };

    const requestHandler = createSamplePeriodRecord();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('Test Error');
      expect(dbConnectionObj.rollback).to.have.been.calledOnce;
      expect(dbConnectionObj.release).to.have.been.calledOnce;
    }
  });
});
