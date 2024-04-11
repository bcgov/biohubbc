import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SQLStatement } from 'sql-template-strings';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../constants/administrative-activity';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { AdministrativeActivityRepository } from './administrative-activity-repository';

chai.use(sinonChai);

describe('AdministrativeActivityRepository', () => {
  it('should construct', () => {
    const mockDBConnection = getMockDBConnection();
    const aaRepo = new AdministrativeActivityRepository(mockDBConnection);

    expect(aaRepo).to.be.instanceof(AdministrativeActivityRepository);
  });

  describe('getAdministrativeActivities', () => {
    it('should get administrative activities when no optional params are provided', async () => {
      const mockResponse = [
        {
          id: 2,
          type: 1,
          type_name: 'System Access',
          status: 3,
          status_name: 'Rejected',
          description: null,
          data: {
            reason: 'Proident sint impe',
            userGuid: '7dfcaece653447d2a7eac74e051a87ab',
            name: 'Curtis Upshall',
            username: 'curtisupshalldev',
            email: 'curtis.upshall@quartech.com',
            identitySource: 'BCEIDBASIC'
          },
          notes: null,
          create_date: '2023-05-02T02:04:10.751Z'
        }
      ];

      const mockDBConnection = getMockDBConnection({
        sql: async () =>
          Promise.resolve({
            rowCount: 1,
            rows: mockResponse
          } as unknown as Promise<QueryResult<any>>)
      });

      const aaRepo = new AdministrativeActivityRepository(mockDBConnection);

      const response = await aaRepo.getAdministrativeActivities();

      expect(response).to.eql([
        {
          id: 2,
          type: 1,
          type_name: 'System Access',
          status: 3,
          status_name: 'Rejected',
          description: null,
          data: {
            reason: 'Proident sint impe',
            userGuid: '7dfcaece653447d2a7eac74e051a87ab',
            name: 'Curtis Upshall',
            username: 'curtisupshalldev',
            email: 'curtis.upshall@quartech.com',
            identitySource: 'BCEIDBASIC'
          },
          notes: null,
          create_date: '2023-05-02T02:04:10.751Z'
        }
      ]);
    });
  });

  describe('createPendingAccessRequest', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert a pending administrative activity record', async () => {
      const mockRecord = {
        administrative_activity_id: 2,
        create_date: new Date()
      };

      const mockResponse = {
        rowCount: 1,
        rows: [mockRecord]
      } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: () => mockResponse });

      const administrativeActivityRepository = new AdministrativeActivityRepository(dbConnectionObj);

      const systemUserId = 1;
      const data = { myData: 'the data' };

      const response = await administrativeActivityRepository.createPendingAccessRequest(systemUserId, data);

      expect(response).to.eql(mockRecord);
    });

    it('should throw an error if the repo fails to insert the administrative activity record', async () => {
      const mockResponse = {
        rowCount: 1,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: () => mockResponse });

      const administrativeActivityRepository = new AdministrativeActivityRepository(dbConnectionObj);

      const systemUserId = 1;
      const data = { myData: 'the data' };

      try {
        await administrativeActivityRepository.createPendingAccessRequest(systemUserId, data);

        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiExecuteSQLError).message).to.equal('Failed to create administrative activity record');
        expect((actualError as ApiExecuteSQLError).errors).to.eql([
          'AdministrativeActivityRepository->createPendingAccessRequest'
        ]);
      }
    });
  });

  describe('getAdministrativeActivityStanding', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns an administrative activity record', async () => {
      const mockRecord = {
        administrative_activity_id: 2,
        create_date: new Date()
      };

      const mockResponse = {
        rowCount: 1,
        rows: [mockRecord]
      } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: () => mockResponse });

      const administrativeActivityRepository = new AdministrativeActivityRepository(dbConnectionObj);

      const userIdentifier = 'username';

      const response = await administrativeActivityRepository.getAdministrativeActivityStanding(userIdentifier);

      expect(response).to.eql(mockRecord);
    });

    it('returns null if no matching administrative record is found', async () => {
      const mockResponse = {
        rowCount: 0,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: () => mockResponse });

      const administrativeActivityRepository = new AdministrativeActivityRepository(dbConnectionObj);

      const userIdentifier = 'username';

      const response = await administrativeActivityRepository.getAdministrativeActivityStanding(userIdentifier);

      expect(response).to.be.undefined;
    });
  });

  describe('putAdministrativeActivity', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('updates an existing administrative activity record', async () => {
      const mockRecord = {
        administrative_activity_id: 1
      };

      const mockResponse = {
        rowCount: 1,
        rows: [mockRecord]
      } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: sinon.fake(() => mockResponse) });

      const administrativeActivityRepository = new AdministrativeActivityRepository(dbConnectionObj);

      const administrativeActivityId = 1;
      const administrativeActivityStatusTypeName = ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.PENDING;

      await administrativeActivityRepository.putAdministrativeActivity(
        administrativeActivityId,
        administrativeActivityStatusTypeName
      );

      expect(dbConnectionObj.sql).to.have.been.calledOnceWith(sinon.match.instanceOf(SQLStatement));
    });

    it('should throw an error if no matching administrative record is found', async () => {
      const mockResponse = {
        rowCount: 0,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: () => mockResponse });

      const administrativeActivityRepository = new AdministrativeActivityRepository(dbConnectionObj);

      const administrativeActivityId = 1;
      const administrativeActivityStatusTypeName = ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.PENDING;

      try {
        await administrativeActivityRepository.putAdministrativeActivity(
          administrativeActivityId,
          administrativeActivityStatusTypeName
        );

        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiExecuteSQLError).message).to.equal('Failed to update administrative activity record');
        expect((actualError as ApiExecuteSQLError).errors).to.eql([
          'AdministrativeActivityRepository->putAdministrativeActivity'
        ]);
      }
    });
  });
});
