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
  afterEach(() => {
    sinon.restore();
  });

  describe('getVantagesForTechnique', () => {
    it('should retrieve the correct vantages for a technique', async () => {
      const mockRecord = [
        {
          method_technique_vantage_id: 1,
          method_technique_id: 2,
          vantage_method_id: 3,
          description: 'test description'
        }
      ];
      const mockResponse = { rows: mockRecord } as QueryResult<any>;
      const dbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const repository = new TechniqueVantageRepository(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;

      const result = await repository.getVantagesForTechnique(surveyId, methodTechniqueId);

      expect(dbConnection.knex).to.have.been.calledOnce;
      expect(result).to.deep.equal(mockRecord);
    });

    it('should throw an error if the query fails', async () => {
      const dbConnection = getMockDBConnection();

      const repository = new TechniqueVantageRepository(dbConnection);

      sinon.stub(dbConnection, 'knex').throws(new Error('Query error'));

      try {
        await repository.getVantagesForTechnique(1, 2);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect((error as HTTPError).message).to.equal('Query error');
      }
    });
  });

  describe('insertVantagesForTechnique', () => {
    it('should insert the vantages successfully', async () => {
      const mockRecord = [{ method_technique_vantage_id: 1 }];
      const mockResponse = { rows: mockRecord } as QueryResult<any>;
      const dbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const repository = new TechniqueVantageRepository(dbConnection);

      const vantageMethods: VantagePostData[] = [{ vantage_method_id: 3 }];

      const surveyId = 1;
      const methodTechniqueId = 2;

      const result = await repository.insertVantagesForTechnique(surveyId, methodTechniqueId, vantageMethods);

      expect(dbConnection.knex).to.have.been.calledOnce;
      expect(result).to.deep.equal(mockRecord);
    });

    it('should throw an error if insertion fails', async () => {
      const dbConnection = getMockDBConnection();

      const repository = new TechniqueVantageRepository(dbConnection);

      const vantageMethods: VantagePostData[] = [{ vantage_method_id: 3 }];

      sinon.stub(dbConnection, 'knex').throws(new Error('Insert error'));

      try {
        await repository.insertVantagesForTechnique(1, 2, vantageMethods);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect((error as HTTPError).message).to.equal('Insert error');
      }
    });
  });

  describe('deleteVantagesForTechnique', () => {
    it('should delete the vantages successfully', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const repository = new TechniqueVantageRepository(dbConnection);

      const vantageMethods: VantagePostData[] = [{ vantage_method_id: 3 }];

      const surveyId = 1;
      const methodTechniqueId = 2;

      await repository.deleteVantagesForTechnique(surveyId, methodTechniqueId, vantageMethods);

      expect(dbConnection.knex).to.have.been.calledOnce;
    });

    it('should throw an error if deletion fails', async () => {
      const dbConnection = getMockDBConnection();

      const repository = new TechniqueVantageRepository(dbConnection);

      const vantageMethods: VantagePostData[] = [{ vantage_method_id: 3 }];

      sinon.stub(dbConnection, 'knex').throws(new Error('Delete error'));

      try {
        await repository.deleteVantagesForTechnique(1, 2, vantageMethods);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect((error as HTTPError).message).to.equal('Delete error');
      }
    });

    it('should do nothing if no vantage methods are provided', async () => {
      const dbConnection = getMockDBConnection();

      const repository = new TechniqueVantageRepository(dbConnection);

      const knexStub = sinon.stub(dbConnection, 'knex');

      await repository.deleteVantagesForTechnique(1, 2, []);

      expect(knexStub).to.not.have.been.called;
    });
  });
});
