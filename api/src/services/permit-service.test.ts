import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../constants/roles';
import { IPermitModel, PermitRepository } from '../repositories/permit-repository';
import { SystemUser } from '../repositories/user-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { PermitService } from './permit-service';
import { UserService } from './user-service';

chai.use(sinonChai);

describe('PermitService', () => {
  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();

    const permitService = new PermitService(mockDBConnection);

    expect(permitService).to.be.instanceof(PermitService);
  });

  describe('getPermitByUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets permit by admin user id', async () => {
      const mockPermitResponse: IPermitModel[] = [
        {
          permit_id: 1,
          survey_id: 1,
          number: 'permit number',
          type: 'permit type',
          create_date: new Date().toISOString(),
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];

      const mockUserObject: SystemUser = {
        system_user_id: 1,
        user_identifier: 'test_user',
        user_guid: 'aaaa',
        identity_source: 'idir',
        record_end_date: '',
        role_ids: [],
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };

      const mockDBConnection = getMockDBConnection();
      const permitService = new PermitService(mockDBConnection);

      const getAllPermits = sinon.stub(PermitRepository.prototype, 'getAllPermits').resolves(mockPermitResponse);

      const getUserByIdStub = sinon.stub(UserService.prototype, 'getUserById').resolves(mockUserObject);

      const response = await permitService.getPermitByUser(mockUserObject.system_user_id);

      expect(getAllPermits).to.be.calledOnce;
      expect(getUserByIdStub).to.be.calledOnceWith(mockUserObject.system_user_id);
      expect(response).to.eql(mockPermitResponse);
    });

    it('Gets permit by data admin user id', async () => {
      const mockPermitResponse: IPermitModel[] = [
        {
          permit_id: 1,
          survey_id: 1,
          number: 'permit number',
          type: 'permit type',
          create_date: new Date().toISOString(),
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];

      const mockUserObject: SystemUser = {
        system_user_id: 1,
        user_identifier: 'test_user',
        user_guid: 'aaaa',
        identity_source: 'idir',
        record_end_date: '',
        role_ids: [],
        role_names: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };

      const mockDBConnection = getMockDBConnection();
      const permitService = new PermitService(mockDBConnection);

      const getAllPermits = sinon.stub(PermitRepository.prototype, 'getAllPermits').resolves(mockPermitResponse);

      const getUserByIdStub = sinon.stub(UserService.prototype, 'getUserById').resolves(mockUserObject);

      const response = await permitService.getPermitByUser(mockUserObject.system_user_id);

      expect(getAllPermits).to.be.calledOnce;
      expect(getUserByIdStub).to.be.calledOnceWith(mockUserObject.system_user_id);
      expect(response).to.eql(mockPermitResponse);
    });

    it('Gets permit by non-admin user id', async () => {
      const mockPermitResponse: IPermitModel[] = [
        {
          permit_id: 1,
          survey_id: 1,
          number: 'permit number',
          type: 'permit type',
          create_date: new Date().toISOString(),
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];

      const mockUserObject: SystemUser = {
        system_user_id: 1,
        user_identifier: 'test_user',
        user_guid: 'aaaa',
        identity_source: 'idir',
        record_end_date: '',
        role_ids: [],
        role_names: [],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };

      const mockDBConnection = getMockDBConnection();
      const permitService = new PermitService(mockDBConnection);

      const getPermitByUser = sinon.stub(PermitRepository.prototype, 'getPermitByUser').resolves(mockPermitResponse);

      const getUserByIdStub = sinon.stub(UserService.prototype, 'getUserById').resolves(mockUserObject);

      const response = await permitService.getPermitByUser(mockUserObject.system_user_id);

      expect(getPermitByUser).to.be.calledOnce;
      expect(getUserByIdStub).to.be.calledOnceWith(mockUserObject.system_user_id);
      expect(response).to.eql(mockPermitResponse);
    });
  });

  describe('getPermitBySurveyId', () => {
    it('fetches permits by survey id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockResponse = [
        {
          permit_id: 2,
          survey_id: 1,
          number: '12345',
          type: 'permit type',
          create_date: new Date().toISOString(),
          create_user: 3,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];

      const getPermitBySurveyIdStub = sinon
        .stub(PermitRepository.prototype, 'getPermitBySurveyId')
        .resolves(mockResponse);

      const permitService = new PermitService(mockDBConnection);

      const response = await permitService.getPermitBySurveyId(1);

      expect(getPermitBySurveyIdStub).to.have.been.calledOnceWith(1);

      expect(response).to.equal(mockResponse);
    });
  });

  describe('createSurveyPermit', () => {
    it('creates a new surevy permit', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockResponse = 2;

      const createSurveyPermitStub = sinon
        .stub(PermitRepository.prototype, 'createSurveyPermit')
        .resolves(mockResponse);

      const permitService = new PermitService(mockDBConnection);

      const response = await permitService.createSurveyPermit(1, '12345', 'permit type');

      expect(createSurveyPermitStub).to.have.been.calledOnceWith(1, '12345', 'permit type');

      expect(response).to.equal(mockResponse);
    });
  });

  describe('updateSurveyPermit', () => {
    it('updates an existing survey permit', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockResponse = 2;

      const updateSurveyPermitStub = sinon
        .stub(PermitRepository.prototype, 'updateSurveyPermit')
        .resolves(mockResponse);

      const permitService = new PermitService(mockDBConnection);

      const response = await permitService.updateSurveyPermit(1, 2, '12345', 'permit type');

      expect(updateSurveyPermitStub).to.have.been.calledOnceWith(1, 2, '12345', 'permit type');

      expect(response).to.equal(mockResponse);
    });
  });

  describe('deleteSurveyPermit', () => {
    it('deletes an existing survey permit', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockResponse = 2;

      const deleteSurveyPermitStub = sinon
        .stub(PermitRepository.prototype, 'deleteSurveyPermit')
        .resolves(mockResponse);

      const permitService = new PermitService(mockDBConnection);

      const response = await permitService.deleteSurveyPermit(1, 2);

      expect(deleteSurveyPermitStub).to.have.been.calledOnceWith(1, 2);

      expect(response).to.equal(mockResponse);
    });
  });
});
