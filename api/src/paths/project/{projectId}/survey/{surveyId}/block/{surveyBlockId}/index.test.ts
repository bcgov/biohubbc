import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { SurveyBlockService } from '../../../../../../../services/survey-block-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';
import { updateSurveyBlock } from '.';
import { getSurveyBlocksForSurveyId } from '..';

chai.use(sinonChai);

describe('getSurveyBlockById', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('successfully retrieves a survey block by id', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getSurveyBlockByIdStub = sinon.stub(SurveyBlockService.prototype, 'getSurveyBlockById').resolves({
      survey_block_id: 1,
      survey_id: 1,
      name: 'Block A',
      description: 'Description A',
      geojson: null,
      sample_block_count: 5,
      revision_count: 0
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: '1', surveyBlockId: '1' };

    const requestHandler = getSurveyBlocksForSurveyId();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(getSurveyBlockByIdStub).to.have.been.calledOnceWith(1, 1);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledOnceWith({
      survey_block_id: 1,
      survey_id: 1,
      name: 'Block A',
      description: 'Description A',
      geojson: null,
      sample_block_count: 5,
      revision_count: 0
    });
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

    sinon.stub(SurveyBlockService.prototype, 'getSurveyBlockById').rejects(new Error('Test Error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: '1', surveyBlockId: '1' };

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

describe('updateSurveyBlock', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('successfully updates survey blocks', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const upsertSurveyBlocksStub = sinon.stub(SurveyBlockService.prototype, 'upsertSurveyBlocks').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: '1' };
    mockReq.body = {
      name: 'Block A',
      description: 'Description A',
      geojson: { type: 'Feature', geometry: {}, properties: {} }
    };

    const requestHandler = updateSurveyBlock();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(upsertSurveyBlocksStub).to.have.been.calledOnceWith(1, [mockReq.body]);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(204);
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

    sinon.stub(SurveyBlockService.prototype, 'upsertSurveyBlocks').rejects(new Error('Test Error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: '1' };
    mockReq.body = {
      blocks: [
        { name: 'Block A', description: 'Description A', geojson: { type: 'Feature', geometry: {}, properties: {} } }
      ]
    };

    const requestHandler = updateSurveyBlock();

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
