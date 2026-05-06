import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as db from '../../../database/db';
import { MarkdownService } from '../../../services/markdown-service';
import { KeycloakUserInformation } from '../../../utils/keycloak-utils';
import { scoreMarkdown } from './index';

chai.use(sinonChai);

describe('scoreMarkdown', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('successfully submits a score for a markdown record', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const handleScoreChangeStub = sinon.stub(MarkdownService.prototype, 'handleScoreChange').resolves(10);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { markdownId: '1' };
    mockReq.body = { score: -1 };
    mockReq.keycloak_token = {} as KeycloakUserInformation;

    const requestHandler = scoreMarkdown();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(handleScoreChangeStub).to.have.been.calledOnceWith(1, 20, -1);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledOnce;

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('returns a 500 error if the user has already scored the markdown record', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const handleScoreChangeStub = sinon.stub(MarkdownService.prototype, 'handleScoreChange').resolves(null);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { markdownId: '1' };
    mockReq.body = { score: -1 };
    mockReq.keycloak_token = {} as KeycloakUserInformation;

    const requestHandler = scoreMarkdown();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(handleScoreChangeStub).to.have.been.calledOnceWith(1, 20, -1);

    expect(mockRes.status).to.have.been.calledWith(500);
    expect(mockRes.json).to.have.been.calledOnce;

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('handles errors gracefully', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const handleScoreChangeStub = sinon
      .stub(MarkdownService.prototype, 'handleScoreChange')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = { markdownId: '1' };
    mockReq.body = { score: 1 };
    mockReq.keycloak_token = {} as KeycloakUserInformation;

    const requestHandler = scoreMarkdown();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected error was not thrown');
    } catch (actualError) {
      expect(handleScoreChangeStub).to.have.been.calledOnceWith(1, 20, 1);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as Error).message).to.equal('a test error');
    }
  });
});
