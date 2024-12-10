import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SurveyBlockService } from '../../../../../../services/survey-block-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { createSurveyBlocks, getSurveyBlocksForSurveyId } from './index';

chai.use(sinonChai);

describe('createSurveyBlocks', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('successfully creates survey blocks', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const insertSurveyBlocksStub = sinon.stub(SurveyBlockService.prototype, 'insertSurveyBlocks').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: '1' };
    mockReq.body = {
      blocks: [
        { name: 'Block A', description: 'Description A', geojson: { type: 'Feature', geometry: {}, properties: {} } }
      ]
    };

    const requestHandler = createSurveyBlocks();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(insertSurveyBlocksStub).to.have.been.calledOnceWith(1, mockReq.body.blocks);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(201);
    expect(mockRes.send).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('rolls back and rethrows error on failure', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(SurveyBlockService.prototype, 'insertSurveyBlocks').rejects(new Error('Test Error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: '1' };
    mockReq.body = {
      blocks: [
        { name: 'Block A', description: 'Description A', geojson: { type: 'Feature', geometry: {}, properties: {} } }
      ]
    };

    const requestHandler = createSurveyBlocks();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected error to be thrown');
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect((actualError as HTTPError).message).to.equal('Test Error');
    }
  });
});

describe('getSurveyBlocks', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('successfully retrieves survey blocks', async () => {
    const mockSurveyId = 1;
    const mockBlock = {
      survey_block_id: 1,
      survey_id: mockSurveyId,
      name: 'Block A',
      description: 'Description A',
      sample_block_count: 5,
      revision_count: 2
    };
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getSurveyBlocksForSurveyIdStub = sinon
      .stub(SurveyBlockService.prototype, 'getSurveyBlocksForSurveyId')
      .resolves([mockBlock]);

    const getSurveyBlocksCountBySurveyIdStub = sinon
      .stub(SurveyBlockService.prototype, 'getSurveyBlocksCountBySurveyId')
      .resolves(1);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: String(mockSurveyId) };
    mockReq.query = { keyword: 'Block' };

    const requestHandler = getSurveyBlocksForSurveyId();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getSurveyBlocksForSurveyIdStub).to.have.been.calledOnce;
    expect(getSurveyBlocksCountBySurveyIdStub).to.have.been.calledOnceWith(mockSurveyId);

    expect(mockRes.jsonValue).to.eql({
      blocks: [mockBlock],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 1,
        sort: undefined,
        order: undefined,
        total: 1
      }
    });

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('rolls back and rethrows error on failure', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(SurveyBlockService.prototype, 'getSurveyBlocksForSurveyId').rejects(new Error('Test Error'));
    sinon.stub(SurveyBlockService.prototype, 'getSurveyBlocksCountBySurveyId').rejects(new Error('Test Error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: '1' };

    const requestHandler = getSurveyBlocksForSurveyId();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected error to be thrown');
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect((actualError as HTTPError).message).to.equal('Test Error');
    }
  });
});
