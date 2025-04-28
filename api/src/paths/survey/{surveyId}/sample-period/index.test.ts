import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { postSamplePeriods } from '.';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { SamplePeriodService } from '../../../../services/sample-period-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';

chai.use(sinonChai);

describe('postSamplePeriods', () => {
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

    const insertSamplePeriodsStub = sinon.stub(SamplePeriodService.prototype, 'insertSamplePeriods').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1'
    };

    mockReq.body = {
      sample_periods: [
        {
          method_technique_id: 2,
          survey_sample_site_id: 3,
          start_date: '2024-12-01',
          start_time: '12:00',
          end_date: '2024-12-05',
          end_time: '12:00'
        }
      ]
    };

    const requestHandler = postSamplePeriods();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(insertSamplePeriodsStub).to.have.been.calledOnceWithExactly(1, [
      {
        method_technique_id: 2,
        survey_sample_site_id: 3,
        start_date: '2024-12-01',
        start_time: '12:00',
        end_date: '2024-12-05',
        end_time: '12:00'
      }
    ]);

    expect(mockRes.statusValue).to.equal(201);
    expect(dbConnectionObj.commit).to.have.been.calledOnce;
    expect(dbConnectionObj.release).to.have.been.calledOnce;
    expect(dbConnectionObj.open).to.have.been.calledOnce;
    expect(mockRes.send).to.have.been.calledOnce;
  });

  it('should catch and re-throw errors', async () => {
    const dbConnectionObj = getMockDBConnection({
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockError = new Error('Test Error');

    const insertSamplePeriodsStub = sinon.stub(SamplePeriodService.prototype, 'insertSamplePeriods').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    mockReq.body = {
      sample_periods: [
        {
          survey_sample_site_id: 3,
          method_technique_id: 2,
          start_date: '2024-12-01',
          start_time: '12:00',
          end_date: '2024-12-05',
          end_time: '12:00'
        }
      ]
    };

    const requestHandler = postSamplePeriods();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect(insertSamplePeriodsStub).to.have.been.calledOnceWithExactly(1, [
        {
          method_technique_id: 2,
          survey_sample_site_id: 3,
          start_date: '2024-12-01',
          start_time: '12:00',
          end_date: '2024-12-05',
          end_time: '12:00'
        }
      ]);
      expect((error as HTTPError).message).to.equal('Test Error');
      expect(dbConnectionObj.rollback).to.have.been.calledOnce;
      expect(dbConnectionObj.release).to.have.been.calledOnce;
    }
  });
});
