import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { MarkdownService } from '../../../services/markdown-service';
import { KeycloakUserInformation } from '../../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
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

    const mockGetUserParticipation = sinon.stub(MarkdownService.prototype, 'getUserParticipation').resolves();

    const mockUpdateScore = sinon.stub(MarkdownService.prototype, 'updateScore').resolves();

    const mockInsertUserParticipation = sinon.stub(MarkdownService.prototype, 'insertUserParticipation').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = { markdownId: '1' };
    mockReq.body = { score: 1 };
    mockReq.keycloak_token = {} as KeycloakUserInformation;

    const requestHandler = scoreMarkdown();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockGetUserParticipation).to.have.been.calledOnceWith(1, 20);
    expect(mockUpdateScore).to.have.been.calledOnceWith(1, 20, 1);
    expect(mockInsertUserParticipation).to.have.been.calledOnceWith(1, 20);
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('throws an error if the user has already voted', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockGetUserParticipation = sinon
      .stub(MarkdownService.prototype, 'getUserParticipation')
      .resolves({ markdown_user_id: 1, system_user_id: 20, markdown_id: 1 });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = { markdownId: '1' };
    mockReq.body = { score: 1 };
    mockReq.keycloak_token = {} as KeycloakUserInformation;

    const requestHandler = scoreMarkdown();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected error was not thrown');
    } catch (actualError) {
      expect(mockGetUserParticipation).to.have.been.calledOnceWith(1, 20);
    }
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

    const mockGetUserParticipation = sinon
      .stub(MarkdownService.prototype, 'getUserParticipation')
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
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockGetUserParticipation).to.have.been.calledOnceWith(1, 20);
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as Error).message).to.equal('a test error');
    }
  });
});
