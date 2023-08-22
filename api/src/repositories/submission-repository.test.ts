import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTP400 } from '../errors/http-error';
import { getMockDBConnection } from '../__mocks__/db';
import { SubmissionRepository } from './submission-repository';

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
        sql: () => mockResponse
      });

      const repo = new SubmissionRepository(dbConnection);
      const response = await repo.insertSubmissionStatus(1, 'validated');

      expect(response).to.be.eql(1);
    });

    it('should throw `Failed to update` error', async () => {
      const mockResponse = ({} as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const repo = new SubmissionRepository(dbConnection);

      try {
        await repo.insertSubmissionStatus(1, 'validated');
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Rejected');
      }
    });
  });
});
