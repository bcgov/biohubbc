import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { IPermitModel, PermitRepository } from './permit-repository';

chai.use(sinonChai);

describe('PermitRepository', () => {
  describe('getPermitBySurveyId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by survey id', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.getPermitBySurveyId(1);

      expect(response).to.eql([{ permit_id: 2 }]);
    });

    it('should return empty rows', async () => {
      const mockResponse = { rows: [], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new PermitRepository(dbConnection);

      const response = await repository.getPermitBySurveyId(1);

      expect(response).to.eql([]);
    });
  });

  describe('getPermitByUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by user', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.getPermitByUser(1);

      expect(response).to.eql([{ permit_id: 2 }]);
    });

    it('should throw an error if no permits were found', async () => {
      const mockQueryResponse = {} as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      try {
        await permitRepository.getPermitByUser(1);
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get permit by user Id');
      }
    });
  });

  describe('getAllPermits', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array containing all survey permits', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.getAllPermits();

      expect(response).to.eql([{ permit_id: 2 }]);
    });

    it('should return empty rows', async () => {
      const mockResponse = { rows: [], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new PermitRepository(dbConnection);

      const response = await repository.getAllPermits();

      expect(response).to.eql([]);
    });
  });

  describe('updateSurveyPermit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by user', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.updateSurveyPermit(1, 2, '12345', 'permit type');

      expect(response).to.equal(2);
    });

    it('should throw an error if update failed', async () => {
      const mockQueryResponse = {
        rowCount: 0,
        rows: []
      } as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      try {
        await permitRepository.updateSurveyPermit(1, 2, '12345', 'permit type');
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get update Survey Permit');
      }
    });
  });

  describe('createSurveyPermit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by user', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.createSurveyPermit(1, '12345', 'permit type');

      expect(response).to.equal(2);
    });

    it('should throw an error if create failed', async () => {
      const mockQueryResponse = {
        rowCount: 0,
        rows: []
      } as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      try {
        await permitRepository.createSurveyPermit(1, '12345', 'permit type');
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get Create Survey Permit');
      }
    });
  });

  describe('deleteSurveyPermit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by user', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.deleteSurveyPermit(1, 2);

      expect(response).to.equal(2);
    });

    it('should throw an error if delete failed', async () => {
      const mockQueryResponse = {
        rowCount: 0,
        rows: []
      } as unknown as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      try {
        await permitRepository.deleteSurveyPermit(1, 2);
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get Delete Survey Permit');
      }
    });
  });
});
