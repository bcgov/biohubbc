import chai, { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getSurveyObservationMeasurements } from '.';
import * as db from '../../../../../../../database/db';
import { CBMeasurementUnit } from '../../../../../../../services/critterbase-service';
import { SubCountService } from '../../../../../../../services/subcount-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('getSurveyObservationMeasurements', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return observation measurement definitions with status 200', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const sampleResult = {
      qualitative_measurements: [
        {
          taxon_measurement_id: '1',
          name: 'life stage',
          itis_tsn: 123456,
          measurement_name: '',
          measurement_desc: '',
          options: []
        }
      ],
      quantitative_measurements: [
        {
          taxon_measurement_id: '1',
          name: 'color',
          itis_tsn: 123456,
          measurement_name: '',
          measurement_desc: '',
          min_value: 1,
          max_value: 10,
          unit: 'gram' as CBMeasurementUnit
        }
      ]
    };

    const getDefinitionsStub = sinon
      .stub(SubCountService.prototype, 'getMeasurementTypeDefinitionsForSurvey')
      .resolves(sampleResult);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getSurveyObservationMeasurements();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(getDefinitionsStub).to.have.been.calledOnceWith(2);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith(sampleResult);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('should rollback and throw error if service fails', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getDefinitionsStub = sinon
      .stub(SubCountService.prototype, 'getMeasurementTypeDefinitionsForSurvey')
      .rejects(new Error('test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getSurveyObservationMeasurements();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected function to throw');
    } catch (err) {
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(getDefinitionsStub).to.have.been.calledOnceWith(2);
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect((err as Error).message).to.equal('test error');
    }
  });
});
