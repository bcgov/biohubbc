import chai, { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { StandardsRepository } from './standards-repository';

chai.use(sinonChai);

describe('StandardsRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getEnvironmentStandards', () => {
    it('should successfully retrieve environment standards', async () => {
      const mockData = {
        quantitative: [
          { name: 'Quantitative Standard 1', description: 'Description 1' },
          { name: 'Quantitative Standard 2', description: 'Description 2' }
        ],
        qualitative: [
          {
            name: 'Qualitative Standard 1',
            description: 'Description 1',
            options: [
              { name: 'Option 1', description: 'Option 1 Description' },
              { name: 'Option 2', description: 'Option 2 Description' }
            ]
          },
          {
            name: 'Qualitative Standard 2',
            description: 'Description 2',
            options: [
              { name: 'Option 3', description: 'Option 3 Description' },
              { name: 'Option 4', description: 'Option 4 Description' }
            ]
          }
        ]
      };

      const mockResponse = {
        rows: [mockData],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const repository = new StandardsRepository(dbConnection);

      const result = await repository.getEnvironmentStandards();

      expect(result).to.deep.equal(mockData);
    });

    it('should handle empty result and throw ApiExecuteSQLError', async () => {
      const mockResponse = {
        rows: [],
        rowCount: 0
      } as any as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const repository = new StandardsRepository(dbConnection);

      try {
        await repository.getEnvironmentStandards();
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eq('Failed to get environment standards');
      }
    });
  });
});
