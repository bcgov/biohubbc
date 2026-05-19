import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { dbDependencies as db } from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { ObservationAnalyticsResponse } from '../../models/observation-analytics';
import { AnalyticsService } from '../../services/analytics-service';
import { getObservationCountByGroup } from './observations';

chai.use(sinonChai);

describe('getObservationCountByGroup', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns observations', async () => {
    const mockAnalyticsResponse: ObservationAnalyticsResponse[] = [
      {
        individual_count: 5,
        individual_percentage: 10,
        row_count: 50,
        qualitative_measurements: [],
        quantitative_measurements: []
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getObservationCountByGroupStub = sinon
      .stub(AnalyticsService.prototype, 'getObservationCountByGroup')
      .resolves(mockAnalyticsResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      surveyIds: ['1', '2'],
      groupByColumns: ['survey_sample_site_id', 'method_technique_id'],
      groupByQuantitativeMeasurements: ['123-456-789'],
      groupByQualitativeMeasurements: ['987-654-321']
    };

    const requestHandler = getObservationCountByGroup();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(getObservationCountByGroupStub).to.have.been.calledOnceWith(
      [1, 2],
      ['survey_sample_site_id', 'method_technique_id'],
      ['123-456-789'],
      ['987-654-321']
    );

    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(mockRes.json).to.have.been.calledOnceWith(mockAnalyticsResponse);

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getObservationCountByGroupStub = sinon
      .stub(AnalyticsService.prototype, 'getObservationCountByGroup')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      surveyIds: ['1', '2'],
      groupByColumns: ['survey_sample_site_id', 'method_technique_id'],
      groupByQuantitativeMeasurements: ['123-456-789'],
      groupByQualitativeMeasurements: ['987-654-321']
    };

    const requestHandler = getObservationCountByGroup();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(getObservationCountByGroupStub).to.have.been.calledOnceWith(
        [1, 2],
        ['survey_sample_site_id', 'method_technique_id'],
        ['123-456-789'],
        ['987-654-321']
      );

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
