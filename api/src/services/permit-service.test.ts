import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { HTTPError } from '../errors/custom-error';
import permit_queries from '../queries/permit';
import { getMockDBConnection } from '../__mocks__/db';
import { PermitService } from './permit-service';

chai.use(sinonChai);

describe('PermitService', () => {
  describe('getAllPermits', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement returned for permits', async () => {
      const mockDBConnection = getMockDBConnection();
      const systemUserId = 22;

      sinon.stub(permit_queries, 'getAllPermitsSQL').returns(null);

      const permitService = new PermitService(mockDBConnection);

      try {
        await permitService.getAllPermits(systemUserId);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
      }
    });

    it('should return null when permits response has no rows', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const systemUserId = 22;

      sinon.stub(permit_queries, 'getAllPermitsSQL').returns(SQL`some query`);

      const permitService = new PermitService(mockDBConnection);

      try {
        await permitService.getAllPermits(systemUserId);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to get all user permits');
      }
    });

    it('should return all permits on success', async () => {
      const allPermits = [
        {
          id: 1,
          number: '123',
          type: 'scientific',
          coordinator_agency: 'agency',
          project_name: 'project 1'
        },
        {
          id: 2,
          number: '12345',
          type: 'wildlife',
          coordinator_agency: 'agency 2',
          project_name: null
        }
      ];

      const mockQueryResponse = ({ rows: allPermits } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const systemUserId = 22;

      sinon.stub(permit_queries, 'getAllPermitsSQL').returns(SQL`some query`);

      const permitService = new PermitService(mockDBConnection);
      const result = await permitService.getAllPermits(systemUserId);

      expect(result).to.eql(allPermits);
    });
  });

  describe('getNonSamplingPermits', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement returned for non-sampling permits', async () => {
      const mockDBConnection = getMockDBConnection();
      const systemUserId = 22;

      sinon.stub(permit_queries, 'getNonSamplingPermitsSQL').returns(null);

      const permitService = new PermitService(mockDBConnection);

      try {
        await permitService.getNonSamplingPermits(systemUserId);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
      }
    });

    it('should throw a 400 error when permits response has no rows', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const systemUserId = 22;

      sinon.stub(permit_queries, 'getNonSamplingPermitsSQL').returns(SQL`some query`);

      const permitService = new PermitService(mockDBConnection);

      try {
        await permitService.getNonSamplingPermits(systemUserId);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to get all user permits');
      }
    });

    it('should return non-sampling permits on success', async () => {
      const nonSamplingPermits = [
        {
          permit_id: 1,
          number: '123',
          type: 'scientific'
        },
        {
          permit_id: 2,
          number: '12345',
          type: 'wildlife'
        }
      ];

      const mockQueryResponse = ({ rows: nonSamplingPermits } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const systemUserId = 22;

      sinon.stub(permit_queries, 'getNonSamplingPermitsSQL').returns(SQL`some query`);

      const permitService = new PermitService(mockDBConnection);
      const result = await permitService.getNonSamplingPermits(systemUserId);

      expect(result).to.eql(nonSamplingPermits);
    });
  });

  describe('createNoSamplePermits', () => {
    const sampleReq = {
      keycloak_token: {},
      body: {
        coordinator: {
          first_name: 'first',
          last_name: 'last',
          email_address: 'email@example.com',
          coordinator_agency: 'agency',
          share_contact_details: true
        },
        permit: {
          permits: [
            {
              permit_number: 'number',
              permit_type: 'type'
            }
          ]
        }
      }
    } as any;

    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no permit passed in request body', async () => {
      const mockDBConnection = getMockDBConnection();

      const permitService = new PermitService(mockDBConnection);

      try {
        await permitService.createNoSamplePermits({ ...sampleReq.body, permit: null });

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing request body param `permit`');
      }
    });

    it('should throw a 400 error when no coordinator passed in request body', async () => {
      const mockDBConnection = getMockDBConnection();

      const permitService = new PermitService(mockDBConnection);

      try {
        await permitService.createNoSamplePermits({ ...sampleReq.body, coordinator: null });

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing request body param `coordinator`');
      }
    });

    it('should return the inserted ids on success', async () => {
      const mockDBConnection = getMockDBConnection();

      const permitService = new PermitService(mockDBConnection);

      sinon.stub(PermitService.prototype, 'insertNoSamplePermit').resolves(20);

      const result = await permitService.createNoSamplePermits(sampleReq.body);

      expect(result).to.eql([20]);
    });

    it('should throw an error when a failure occurs', async () => {
      const expectedError = new Error('cannot process request');

      const mockDBConnection = getMockDBConnection();

      const permitService = new PermitService(mockDBConnection);

      sinon.stub(PermitService.prototype, 'insertNoSamplePermit').rejects(expectedError);

      try {
        await permitService.createNoSamplePermits(sampleReq.body);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal(expectedError.message);
      }
    });
  });

  describe('insertNoSamplePermit', () => {
    afterEach(() => {
      sinon.restore();
    });

    const permitData = {
      permit_number: 'number',
      permit_type: 'type'
    };

    const coordinatorData = {
      first_name: 'first',
      last_name: 'last',
      email_address: 'email@example.com',
      coordinator_agency: 'agency',
      share_contact_details: true
    };

    it('should throw an error when cannot generate post sql statement', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(permit_queries, 'postPermitNoSamplingSQL').returns(null);

      const permitService = new PermitService(mockDBConnection);

      try {
        await permitService.insertNoSamplePermit(permitData, coordinatorData);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
      }
    });

    it('should throw a HTTP 400 error when failed to insert non-sampling permits cause result is null', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(permit_queries, 'postPermitNoSamplingSQL').returns(SQL`some`);

      const permitService = new PermitService(mockDBConnection);

      try {
        await permitService.insertNoSamplePermit(permitData, coordinatorData);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to insert non-sampling permit data');
      }
    });

    it('should return the result id on success', async () => {
      const mockQueryResponse = ({ rows: [{ id: 12 }] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(permit_queries, 'postPermitNoSamplingSQL').returns(SQL`some`);

      const permitService = new PermitService(mockDBConnection);

      const res = await permitService.insertNoSamplePermit(permitData, coordinatorData);

      expect(res).to.equal(12);
    });
  });
});
