import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MarkdownRepository } from '../repositories/markdown-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { MarkdownService } from './markdown-service';

chai.use(sinonChai);

describe('MarkdownService', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();

    const markdownService = new MarkdownService(mockDBConnection);

    expect(markdownService).to.be.instanceof(MarkdownService);
  });

  describe('getMarkdownByTypeName', () => {
    it('should return markdown object for a given type name', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockMarkdownObject = {
        markdown_id: 1,
        markdown_type_id: 1,
        data: 'Sample markdown data',
        participated: false
      };

      const getMarkdownByTypeNameStub = sinon
        .stub(MarkdownRepository.prototype, 'getMarkdownByTypeName')
        .resolves(mockMarkdownObject);

      const markdownService = new MarkdownService(mockDBConnection);
      const queryObject = { system_user_id: 1, markdown_type_name: 'example' };

      const response = await markdownService.getMarkdownByTypeName(queryObject);

      expect(getMarkdownByTypeNameStub).to.be.calledOnceWith(queryObject);
      expect(response).to.eql(mockMarkdownObject);
    });
  });

  describe('handleScoreChange', () => {
    it('should update the score and return the new score', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockParticipation = null;

      const markdownId = 1;
      const systemUserId = 2;
      const delta = 1;

      const updateScoreStub = sinon.stub(MarkdownRepository.prototype, 'updateScore').resolves(delta);
      const getUserParticipationStub = sinon
        .stub(MarkdownRepository.prototype, 'getUserParticipation')
        .resolves(mockParticipation);
      const insertUserParticipationStub = sinon
        .stub(MarkdownRepository.prototype, 'insertUserParticipation')
        .resolves();

      const markdownService = new MarkdownService(mockDBConnection);

      const response = await markdownService.handleScoreChange(markdownId, systemUserId, delta);

      expect(updateScoreStub).to.be.calledOnceWith(markdownId, delta);
      expect(getUserParticipationStub).to.be.calledOnceWith(markdownId, systemUserId);
      expect(insertUserParticipationStub).to.be.calledOnceWith(markdownId, systemUserId);

      expect(response).to.equal(delta);
    });

    it('should not update the score if the user has already participated', async () => {
      const mockDBConnection = getMockDBConnection();

      const markdownId = 1;
      const systemUserId = 2;

      const delta = 1;
      const mockParticipation = { markdown_user_id: 1, markdown_id: markdownId, system_user_id: systemUserId };

      const updateScoreStub = sinon.stub(MarkdownRepository.prototype, 'updateScore').resolves(delta);
      const getUserParticipationStub = sinon
        .stub(MarkdownRepository.prototype, 'getUserParticipation')
        .resolves(mockParticipation);
      const insertUserParticipationStub = sinon
        .stub(MarkdownRepository.prototype, 'insertUserParticipation')
        .resolves();

      const markdownService = new MarkdownService(mockDBConnection);

      const response = await markdownService.handleScoreChange(markdownId, systemUserId, delta);

      expect(getUserParticipationStub).to.be.calledOnceWith(markdownId, systemUserId);
      expect(updateScoreStub).to.not.be.called;
      expect(insertUserParticipationStub).to.not.be.called;

      expect(response).to.equal(null);
    });
  });

  describe('updateScore', () => {
    it('should update the score and return the new score', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockScore = 5;
      const markdownId = 1;
      const delta = 1;

      const updateScoreStub = sinon.stub(MarkdownRepository.prototype, 'updateScore').resolves(mockScore);

      const markdownService = new MarkdownService(mockDBConnection);

      const response = await markdownService.updateScore(markdownId, delta);

      expect(updateScoreStub).to.be.calledOnceWith(markdownId, delta);
      expect(response).to.equal(mockScore);
    });
  });

  describe('getUserParticipation', () => {
    it('should get a markdown user participation record', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockResponse = { markdown_user_id: 1, markdown_id: 3, system_user_id: 2 };

      const getUserParticipationStub = sinon
        .stub(MarkdownRepository.prototype, 'getUserParticipation')
        .resolves(mockResponse);

      const markdownService = new MarkdownService(mockDBConnection);

      const response = await markdownService.getUserParticipation(
        mockResponse.markdown_id,
        mockResponse.system_user_id
      );

      expect(getUserParticipationStub).to.be.calledOnceWith(mockResponse.markdown_id, mockResponse.system_user_id);
      expect(response).to.equal(mockResponse);
    });
  });

  describe('insertUserParticipation', () => {
    it('should insert user participation and return the result', async () => {
      const mockDBConnection = getMockDBConnection();

      const markdownId = 1;
      const systemUserId = 2;

      const insertParticipationResponse = 1;

      const insertUserParticipationStub = sinon
        .stub(MarkdownRepository.prototype, 'insertUserParticipation')
        .resolves(insertParticipationResponse);

      const markdownService = new MarkdownService(mockDBConnection);

      const response = await markdownService.insertUserParticipation(markdownId, systemUserId);

      expect(insertUserParticipationStub).to.be.calledOnceWith(markdownId, systemUserId);
      expect(response).to.equal(insertParticipationResponse);
    });
  });
});
