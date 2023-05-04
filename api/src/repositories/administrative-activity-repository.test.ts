import chai, { expect } from "chai";
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from "../__mocks__/db";
import { AdministrativeActivityRepository } from "./administrative-activity-repository";
import { QueryResult } from "pg";

chai.use(sinonChai);

describe.only('AdministrativeActivityRepository', () => {
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
        sql: async () => Promise.resolve({
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
    // @TODO
  });

  describe('getAdministrativeActivityStanding', () => {
    // @TODO
  });

  describe('putAdministrativeActivity', () => {
    // @TODO
  });
});
