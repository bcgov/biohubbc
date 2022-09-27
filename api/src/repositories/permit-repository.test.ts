import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { IPermitModel, PermitRepository } from './permit-repository';

chai.use(sinonChai);

describe('PermitRepository', () => {
  describe('getPermitBySurveyId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by survey id', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown) as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.getPermitBySurveyId(1);

      expect(response).to.eql([{ permit_id: 2 }]);
    });
  });

  describe('getPermitByUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by user', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown) as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.getPermitByUser(1);

      expect(response).to.eql([{ permit_id: 2 }]);
    });
  });

  describe('getAllPermits', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array containing all survey permits', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown) as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.getAllPermits();

      expect(response).to.eql([{ permit_id: 2 }]);
    });
  });

  describe('updateSurveyPermit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by user', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown) as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.updateSurveyPermit(1, 2, '12345', 'permit type');

      expect(response).to.equal(2);
    });
  });

  describe('createSurveyPermit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by user', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown) as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.createSurveyPermit(1, '12345', 'permit type');

      expect(response).to.equal(2);
    });
  });

  describe('deleteSurveyPermit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of survey permits by user', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ permit_id: 2 }]
      } as unknown) as QueryResult<IPermitModel>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new PermitRepository(mockDBConnection);

      const response = await permitRepository.deleteSurveyPermit(1, 2);

      expect(response).to.equal(2);
    });
  });
});
