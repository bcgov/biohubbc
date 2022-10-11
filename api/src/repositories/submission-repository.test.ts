import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTP400 } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { SubmissionRepository } from './submission-repsitory';

chai.use(sinonChai);

describe('SubmissionRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertSubmissionStatus', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            id: 1
          }
        ]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SubmissionRepository(dbConnection);
      const response = await repo.insertSubmissionStatus(1, 'validated');

      expect(response).to.be.eql(1);
    });

    it('should throw `Failed to build SQL` error', async () => {
      const mockQuery = sinon.stub(queries.survey, 'insertOccurrenceSubmissionStatusSQL').returns(null);
      const dbConnection = getMockDBConnection();
      const repo = new SubmissionRepository(dbConnection);

      try {
        await repo.insertSubmissionStatus(1, 'validated');
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to build SQL insert statement');
      }
    });

    it('should throw `Failed to insert` error', async () => {
      const mockResponse = ({ rows: [{}] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SubmissionRepository(dbConnection);

      try {
        await repo.insertSubmissionStatus(1, 'validated');
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert survey submission status data');
      }
    });
  });

  describe('insertSubmissionMessage', () => {
    it('should throw `Failed to build SQL` error', async () => {
      const mockQuery = sinon.stub(queries.survey, 'insertOccurrenceSubmissionMessageSQL').returns(null);
      const dbConnection = getMockDBConnection();
      const repo = new SubmissionRepository(dbConnection);

      try {
        await repo.insertSubmissionMessage(1, 'validated', '', '');
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to build SQL insert statement');
      }
    });

    it('should throw `Failed to insert` error', async () => {
      const mockResponse = ({ rows: [{}] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SubmissionRepository(dbConnection);

      try {
        await repo.insertSubmissionMessage(1, 'validated', 'message', 'error');
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert survey submission message data');
      }
    });
  });
});
