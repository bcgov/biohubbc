import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { MarkdownRepository } from './markdown-repository'; // Adjust the import based on your structure

chai.use(sinonChai);

describe('MarkdownRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getMarkdownByTypeName', () => {
    it('should return a markdown object for a given type name', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ markdown_id: 1, markdown_type_id: 1, data: 'Sample markdown data', participated: false }]
      } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const markdownRepository = new MarkdownRepository(mockDBConnection);
      const queryObject = { system_user_id: 1, markdown_type_name: 'example' };

      const response = await markdownRepository.getMarkdownByTypeName(queryObject);

      expect(response).to.eql(mockQueryResponse.rows[0]);
    });
  });

  describe('updateScore', () => {
    it('should update the score and return the new score', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ score: 5 }]
      } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const markdownRepository = new MarkdownRepository(mockDBConnection);
      const markdownId = 1;
      const delta = 1;

      const response = await markdownRepository.updateScore(markdownId, delta);

      expect(response).to.eql({ score: 5 });
    });

    it('should not update the score if the user has already participated', async () => {
      const mockQueryResponse = {
        rowCount: 0,
        rows: []
      } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const markdownRepository = new MarkdownRepository(mockDBConnection);
      const markdownId = 1;
      const delta = 1;

      const response = await markdownRepository.updateScore(markdownId, delta);

      expect(response).to.be.undefined;
    });
  });

  describe('getUserParticipation', () => {
    it('should get user participation successfully', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves({ rows: [1] })
      });

      const markdownRepository = new MarkdownRepository(mockDBConnection);
      const markdownId = 1;
      const systemUserId = 2;

      const response = await markdownRepository.getUserParticipation(markdownId, systemUserId);

      expect(response).to.equal(1);
    });
  });

  describe('insertUserParticipation', () => {
    it('should insert user participation successfully', async () => {
      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves({ rows: [1] })
      });

      const markdownRepository = new MarkdownRepository(mockDBConnection);
      const markdownId = 1;
      const systemUserId = 2;

      const response = await markdownRepository.insertUserParticipation(markdownId, systemUserId);

      expect(response).to.equal(1);
    });

    it('should not insert if participation already exists', async () => {
      const mockMarkdownUserId = 1;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves({ rowCount: 1, rows: [mockMarkdownUserId] })
      });

      const markdownRepository = new MarkdownRepository(mockDBConnection);
      const markdownId = 1;
      const systemUserId = 2;

      const response = await markdownRepository.insertUserParticipation(markdownId, systemUserId);

      expect(response).to.equal(mockMarkdownUserId);
    });
  });
});
