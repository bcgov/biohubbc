import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTPError } from '../errors/http-error';
import { getMockDBConnection } from '../__mocks__/db';
import { TechniqueVantageRepository } from './technique-vantage-repository';
import { VantagePostData } from './vantage-mode-repository';

chai.use(sinonChai);

describe('TechniqueVantageRepository', () => {
  let dbConnection: any;
  let repository: TechniqueVantageRepository;

  beforeEach(() => {
    dbConnection = getMockDBConnection();
    repository = new TechniqueVantageRepository(dbConnection);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getVantageModesForTechnique', () => {
    it('should retrieve the correct vantage modes for a technique', async () => {
      const mockRecord = [
        {
          method_technique_vantage_mode_id: 1,
          method_technique_id: 2,
          vantage_mode_method_id: 3,
          description: 'test description'
        }
      ];

      const mockResponse = { rows: mockRecord } as QueryResult<any>;
      const knexStub = sinon.stub(dbConnection, 'knex').resolves(mockResponse);

      const surveyId = 1;
      const methodTechniqueId = 2;

      const result = await repository.getVantageModesForTechnique(surveyId, methodTechniqueId);

      expect(knexStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(mockRecord);
    });

    it('should throw an error if the query fails', async () => {
      sinon.stub(dbConnection, 'knex').throws(new Error('Query error'));

      try {
        await repository.getVantageModesForTechnique(1, 2);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect((error as HTTPError).message).to.equal('Query error');
      }
    });
  });

  describe('insertVantageModesForTechnique', () => {
    it('should insert the vantage modes successfully', async () => {
      const mockRecord = [{ method_technique_vantage_mode_id: 1 }];

      const vantageModeMethods: VantagePostData[] = [{ vantage_mode_method_id: 3 }];

      const mockResponse = { rows: mockRecord } as QueryResult<any>;
      const knexStub = sinon.stub(dbConnection, 'knex').resolves(mockResponse);

      const surveyId = 1;
      const methodTechniqueId = 2;

      const result = await repository.insertVantageModesForTechnique(surveyId, methodTechniqueId, vantageModeMethods);

      expect(knexStub).to.have.been.calledOnce;
      expect(result).to.deep.equal(mockRecord);
    });

    it('should throw an error if insertion fails', async () => {
      const vantageModeMethods: VantagePostData[] = [{ vantage_mode_method_id: 3 }];

      sinon.stub(dbConnection, 'knex').throws(new Error('Insert error'));

      try {
        await repository.insertVantageModesForTechnique(1, 2, vantageModeMethods);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect((error as HTTPError).message).to.equal('Insert error');
      }
    });
  });

  describe('deleteVantageModesForTechnique', () => {
    it('should delete the vantage modes successfully', async () => {
      const vantageModeMethods: VantagePostData[] = [{ vantage_mode_method_id: 3 }];

      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const knexStub = sinon.stub(dbConnection, 'knex').resolves(mockResponse);

      const surveyId = 1;
      const methodTechniqueId = 2;

      await repository.deleteVantageModesForTechnique(surveyId, methodTechniqueId, vantageModeMethods);

      expect(knexStub).to.have.been.calledOnce;
    });

    it('should throw an error if deletion fails', async () => {
      const vantageModeMethods: VantagePostData[] = [{ vantage_mode_method_id: 3 }];

      sinon.stub(dbConnection, 'knex').throws(new Error('Delete error'));

      try {
        await repository.deleteVantageModesForTechnique(1, 2, vantageModeMethods);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect((error as HTTPError).message).to.equal('Delete error');
      }
    });

    it('should do nothing if no vantage mode methods are provided', async () => {
      const knexStub = sinon.stub(dbConnection, 'knex');

      await repository.deleteVantageModesForTechnique(1, 2, []);

      expect(knexStub).to.not.have.been.called;
    });
  });
});
