import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../database/db';
import { ObservationSubCountMeasurementService } from '../../../../../../../services/observation-subcount-measurement-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';
import { deleteObservationMeasurements } from './delete';

chai.use(sinonChai);

describe('deleteObservationMeasurements', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete observation measurements and return 200', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const deleteStub = sinon
      .stub(ObservationSubCountMeasurementService.prototype, 'deleteMeasurementsForTaxonMeasurementIds')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      measurement_ids: ['uuid-1', 'uuid-2']
    };

    const requestHandler = deleteObservationMeasurements();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(deleteStub).to.have.been.calledOnceWith(2, ['uuid-1', 'uuid-2']);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.send).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('should rollback and throw error if deletion fails', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const deleteStub = sinon
      .stub(ObservationSubCountMeasurementService.prototype, 'deleteMeasurementsForTaxonMeasurementIds')
      .rejects(new Error('test-error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      measurement_ids: ['uuid-1', 'uuid-2']
    };

    const requestHandler = deleteObservationMeasurements();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected error to be thrown');
    } catch (err) {
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(deleteStub).to.have.been.calledOnceWith(2, ['uuid-1', 'uuid-2']);
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect((err as Error).message).to.equal('test-error');
    }
  });
});
