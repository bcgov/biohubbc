import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getSamplePeriodById, updateSamplePeriod } from '.';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { SurveySamplePeriodDetails } from '../../../../../repositories/sample-period-repository';
import { SamplePeriodService } from '../../../../../services/sample-period-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';

chai.use(sinonChai);

describe('getSamplePeriodById', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should successfully get a survey sample period', async () => {
    const mockSamplePeriod: SurveySamplePeriodDetails = {
      survey_sample_period_id: 1,
      survey_id: 4,
      survey_sample_site_id: 2,
      method_technique_id: 3,
      start_date: '2024-12-01',
      end_date: '2024-12-05',
      start_time: '08:00',
      end_time: '16:00',
      method_technique: {
        method_technique_id: 4,
        name: 'Tech A',
        description: 'Sample technique A',
        method_response_metric_id: 5
      },
      survey_sample_site: {
        survey_sample_site_id: 2,
        name: 'Site A'
      }
    };

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(SamplePeriodService.prototype, 'getSamplePeriodById').resolves(mockSamplePeriod);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      surveyId: '1',
      surveySamplePeriodId: '1'
    };

    const requestHandler = getSamplePeriodById();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
    expect(mockRes.jsonValue).to.eql(mockSamplePeriod);
  });

  it('should handle and re-throw errors', async () => {
    const mockDBConnection = getMockDBConnection({
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('Database error');

    sinon.stub(SamplePeriodService.prototype, 'getSamplePeriodById').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySamplePeriodId: '1'
    };

    const requestHandler = getSamplePeriodById();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('Database error');
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});

describe('updateSamplePeriod', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should successfully update a survey sample period', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(SamplePeriodService.prototype, 'updateSamplePeriod').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      surveyId: '1',
      surveySamplePeriodId: '1'
    };
    mockReq.body = {
      method_technique_id: 1,
      sample_period: { start_date: '2020-01-01', start_time: '10:10', end_date: '2022-03-03' }
    };

    const requestHandler = updateSamplePeriod();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(204);
    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('should handle and re-throw errors', async () => {
    const mockDBConnection = getMockDBConnection({
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('Database error');
    sinon.stub(SamplePeriodService.prototype, 'updateSamplePeriod').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      surveyId: '1',
      surveySamplePeriodId: '1'
    };
    mockReq.body = {
      method_technique_id: 1,
      sample_period: {}
    };

    const requestHandler = updateSamplePeriod();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('Database error');
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
