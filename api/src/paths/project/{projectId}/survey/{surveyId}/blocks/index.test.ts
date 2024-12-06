import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SurveyBlockService } from '../../../../../../services/survey-block-service';
import { createSurveyBlocks } from './index';

chai.use(sinonChai);

describe('createSurveyBlocks', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('successfully creates survey blocks', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const upsertSurveyBlocksStub = sinon.stub(SurveyBlockService.prototype, 'upsertSurveyBlocks').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: '1' };
    mockReq.body = {
      blocks: [
        { name: 'Block A', description: 'Description A', geojson: { type: 'Feature', geometry: {}, properties: {} } },
      ],
    };

    const requestHandler = createSurveyBlocks();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(upsertSurveyBlocksStub).to.have.been.calledOnceWith(1, mockReq.body.blocks);
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
      release: sinon.stub(),
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(SurveyBlockService.prototype, 'upsertSurveyBlocks').rejects(new Error('Test Error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { surveyId: '1' };
    mockReq.body = {
      blocks: [
        { name: 'Block A', description: 'Description A', geojson: { type: 'Feature', geometry: {}, properties: {} } },
      ],
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
