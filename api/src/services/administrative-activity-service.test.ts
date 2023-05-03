import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { AdministrativeActivityService } from './administrative-activity-service';
import { AdministrativeActivityRepository } from '../repositories/administrative-activity-repository';

chai.use(sinonChai);

describe.only('AdministrativeActivityService', () => {
  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();
    const aaService = new AdministrativeActivityService(mockDBConnection);

    expect(aaService).to.be.instanceof(AdministrativeActivityService);
  });

  describe('getAdministrativeActivities', () => {
    it('should get administrative activity records', async () => {
      const mockDBConnection = getMockDBConnection();
      const aaService = new AdministrativeActivityService(mockDBConnection);

      const aaTypeNames = ['System Access'];
      const aaStatusTypes = ['Pending', 'Rejected'];

      const repoStub = sinon.stub(AdministrativeActivityRepository.prototype, 'getAdministrativeActivities')
        .resolves([
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

      const response = await aaService.getAdministrativeActivities(aaTypeNames, aaStatusTypes);

      expect(repoStub).to.be.calledWith(['System Access'], ['Pending', 'Rejected']);
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
      ])
    });
  });

  describe('createPendingAccessRequest', () => {
    it('should create an administrative activity representing an access request', async () => {
      // @TODO

    });
  });

  describe('getAdministrativeActivityStanding', () => {
    // @TODO
  });

  describe('putAdministrativeActivity', () => {
    // @TODO
  });

  describe('sendAccessRequestEmail', () => {
    // @TODO
  });
});
