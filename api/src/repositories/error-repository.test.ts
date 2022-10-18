import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { ApiError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { ErrorRepository } from './error-repository';

chai.use(sinonChai);

describe('OccurrenceRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertSubmissionStatus', () => {
    it('should return submission ids if valid', async () => {
      const returnValue = { submission_status_id: 1, submission_status_type_id: 2 };
      const mockResponse = ({ rows: [returnValue], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new ErrorRepository(dbConnection);
      const response = await repo.insertSubmissionStatus(1, SUBMISSION_STATUS_TYPE.SUBMITTED);

      expect(response).to.eql(returnValue);
    });

    it('should throw `Failed to insert` error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new ErrorRepository(dbConnection);
      try {
        await repo.insertSubmissionStatus(1, SUBMISSION_STATUS_TYPE.SUBMITTED);
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to insert submission status record');
      }
    });
  });

  describe('insertSubmissionMessage', () => {
    it('should return submission ids if valid', async () => {
      const returnValue = { submission_message_id: 1, submission_message_type_id: 2 };
      const mockResponse = ({ rows: [returnValue], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new ErrorRepository(dbConnection);
      const response = await repo.insertSubmissionMessage(
        1,
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_TRANSFORMATION_RULES,
        'msg'
      );

      expect(response).to.eql(returnValue);
    });

    it('should throw `Failed to insert` error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new ErrorRepository(dbConnection);
      try {
        await repo.insertSubmissionMessage(1, SUBMISSION_MESSAGE_TYPE.FAILED_GET_TRANSFORMATION_RULES, 'msg');
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to insert submission message record');
      }
    });
  });
});
