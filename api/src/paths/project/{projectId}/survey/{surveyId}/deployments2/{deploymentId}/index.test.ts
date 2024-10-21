import { expect } from 'chai';
import sinon from 'sinon';
import { deleteDeployment, getDeploymentById, updateDeployment } from '.';
import * as db from '../../../../../../../database/db';
import { DeploymentService } from '../../../../../../../services/deployment-services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

describe('getDeploymentById', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Gets an existing deployment', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockDeployment = {
      deployment2_id: 2,
      survey_id: 3,
      critter_id: 4,
      device_id: 5,
      frequency: 100,
      frequency_unit_id: 1,
      attachment_start_date: '2021-01-01',
      attachment_start_time: '00:00',
      attachment_end_date: '2021-01-02',
      attachment_end_time: '00:00',
      critterbase_start_capture_id: '123-456-789',
      critterbase_end_capture_id: null,
      critterbase_end_mortality_id: null
    };

    sinon.stub(DeploymentService.prototype, 'getDeploymentById').resolves(mockDeployment);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deploymentId: '3'
    };

    const requestHandler = getDeploymentById();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.json).to.have.been.calledWith({ deployment: mockDeployment });
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('Test error');

    sinon.stub(DeploymentService.prototype, 'getDeploymentById').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deploymentId: '3'
    };

    const requestHandler = getDeploymentById();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});

describe('updateDeployment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('updates an existing deployment', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(DeploymentService.prototype, 'updateDeployment').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deploymentId: '3'
    };
    mockReq.body = {
      critter_id: 4,
      device_id: 5,
      frequency: 100,
      frequency_unit_id: 1,
      attachment_start_date: '2021-01-01',
      attachment_start_time: '00:00',
      attachment_end_date: '2021-01-02',
      attachment_end_time: '00:00',
      critterbase_start_capture_id: '123-456-789',
      critterbase_end_capture_id: null,
      critterbase_end_mortality_id: null
    };

    const requestHandler = updateDeployment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');

    sinon.stub(DeploymentService.prototype, 'updateDeployment').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deploymentId: '3'
    };

    const requestHandler = updateDeployment();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});

describe('deleteDeployment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('deletes an existing deployment', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(DeploymentService.prototype, 'deleteDeployment').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deploymentId: '3'
    };

    const requestHandler = deleteDeployment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');

    sinon.stub(DeploymentService.prototype, 'deleteDeployment').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deploymentId: '3'
    };

    const requestHandler = deleteDeployment();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
