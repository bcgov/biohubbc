import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../constants/administrative-activity';
import { AdministrativeActivityRepository } from '../repositories/administrative-activity-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { AdministrativeActivityService } from './administrative-activity-service';
import { GCNotifyService, IgcNotifyPostReturn } from './gcnotify-service';

chai.use(sinonChai);

describe('AdministrativeActivityService', () => {
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

      const repoStub = sinon.stub(AdministrativeActivityRepository.prototype, 'getAdministrativeActivities').resolves([
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
      ]);
    });
  });

  describe('createPendingAccessRequest', () => {
    it('should create an administrative activity representing an access request', async () => {
      const dbConnection = getMockDBConnection();

      const mockRepoResponse = { id: 1, date: '2023-08-03' };
      const repoStub = sinon
        .stub(AdministrativeActivityRepository.prototype, 'createPendingAccessRequest')
        .resolves(mockRepoResponse);

      const service = new AdministrativeActivityService(dbConnection);

      const systemUserId = 2;
      const data = { myData: 'the data' };

      const response = await service.createPendingAccessRequest(systemUserId, data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(mockRepoResponse);
    });
  });

  describe('getAdministrativeActivityStanding', () => {
    it('should fetch the administrative activity status for a user', async () => {
      const dbConnection = getMockDBConnection();

      const mockRepoResponse = {
        has_pending_access_request: false,
        has_one_or_more_project_roles: false
      };
      const repoStub = sinon
        .stub(AdministrativeActivityRepository.prototype, 'getAdministrativeActivityStanding')
        .resolves(mockRepoResponse);

      const service = new AdministrativeActivityService(dbConnection);

      const userIdentifier = 'username';

      const response = await service.getAdministrativeActivityStanding(userIdentifier);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(mockRepoResponse);
    });
  });

  describe('putAdministrativeActivity', () => {
    it('should update an administrative activity record and return the id', async () => {
      const dbConnection = getMockDBConnection();

      const repoStub = sinon.stub(AdministrativeActivityRepository.prototype, 'putAdministrativeActivity').resolves();

      const service = new AdministrativeActivityService(dbConnection);

      const administrativeActivityId = 1;
      const administrativeActivityStatusTypeName = ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.ACTIONED;

      await service.putAdministrativeActivity(administrativeActivityId, administrativeActivityStatusTypeName);

      expect(repoStub).to.be.calledOnce;
    });
  });

  describe('sendAccessRequestNotificationEmailToAdmin', () => {
    it('sends an email notification notifying the admin that a new administrative activity is pending', async () => {
      const dbConnection = getMockDBConnection();

      const mockGCNotifyResponse: IgcNotifyPostReturn = {
        content: {},
        id: '123',
        reference: 'abc',
        scheduled_for: 'def',
        template: {},
        uri: 'http://uri.comF'
      };

      const gcNotifyServiceStub = sinon
        .stub(GCNotifyService.prototype, 'sendEmailGCNotification')
        .resolves(mockGCNotifyResponse);

      const service = new AdministrativeActivityService(dbConnection);

      const response = await service.sendAccessRequestNotificationEmailToAdmin();

      expect(response).to.eql(mockGCNotifyResponse);
      expect(gcNotifyServiceStub).to.have.been.calledOnceWith(sinon.match.string, sinon.match.object);
    });
  });
});
