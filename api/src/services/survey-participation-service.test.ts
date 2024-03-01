import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { SurveyParticipationRepository } from '../repositories/survey-participation-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { SurveyParticipationService } from './survey-participation-service';

chai.use(sinonChai);

describe('SurveyParticipationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSurveyJobs', () => {
    it('calls getSurveyJobs and returns the result', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyParticipationService(dbConnection);

      const repoStub = sinon.stub(SurveyParticipationRepository.prototype, 'getSurveyJobs').resolves([
        {
          survey_job_id: 1,
          name: 'name',
          record_effective_date: '2021-01-01',
          record_end_date: null,
          create_date: '2021-01-01',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 1
        }
      ]);

      const response = await service.getSurveyJobs();

      expect(repoStub).to.be.calledOnce;

      expect(response).to.eql([
        {
          survey_job_id: 1,
          name: 'name',
          record_effective_date: '2021-01-01',
          record_end_date: null,
          create_date: '2021-01-01',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 1
        }
      ]);
    });
  });

  describe('getSurveyParticipant', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyParticipationService(dbConnection);

      const data = {
        projectId: 1,
        systemUserId: 1
      };

      const repoStub = sinon.stub(SurveyParticipationRepository.prototype, 'getSurveyParticipant').resolves({
        system_user_id: 2,
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser',
        survey_participation_id: 1,
        survey_id: 1,
        survey_job_id: 1,
        survey_job_name: 'survey job name'
      });

      const response = await service.getSurveyParticipant(data.projectId, data.systemUserId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({
        system_user_id: 2,
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser',
        survey_participation_id: 1,
        survey_id: 1,
        survey_job_id: 1,
        survey_job_name: 'survey job name'
      });
    });
  });

  describe('getSurveyParticipants', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyParticipationService(dbConnection);

      const data = {
        projectId: 1
      };

      const repoStub = sinon.stub(SurveyParticipationRepository.prototype, 'getSurveyParticipants').resolves([
        {
          system_user_id: 2,
          agency: null,
          display_name: 'test user',
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
          record_end_date: null,
          role_ids: [1],
          role_names: ['Role1'],
          user_guid: '123-456-789',
          user_identifier: 'testuser',
          survey_participation_id: 1,
          survey_id: 1,
          survey_job_id: 1,
          survey_job_name: 'survey job name'
        }
      ]);

      const response = await service.getSurveyParticipants(data.projectId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([
        {
          system_user_id: 2,
          agency: null,
          display_name: 'test user',
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
          record_end_date: null,
          role_ids: [1],
          role_names: ['Role1'],
          user_guid: '123-456-789',
          user_identifier: 'testuser',
          survey_participation_id: 1,
          survey_id: 1,
          survey_job_id: 1,
          survey_job_name: 'survey job name'
        }
      ]);
    });
  });

  describe('insertSurveyParticipant', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyParticipationService(dbConnection);

      const data = {
        surveyId: 1,
        systemUserId: 1,
        surveyJobName: 'name'
      };

      const repoStub = sinon.stub(SurveyParticipationRepository.prototype, 'insertSurveyParticipant').resolves();

      const response = await service.insertSurveyParticipant(data.surveyId, data.systemUserId, data.surveyJobName);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyParticipantJob', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyParticipationService(dbConnection);

      const data = {
        surveyParticipationId: 1,
        surveyJobName: 'name'
      };

      const repoStub = sinon.stub(SurveyParticipationRepository.prototype, 'updateSurveyParticipantJob').resolves();

      const response = await service.updateSurveyParticipantJob(data.surveyParticipationId, data.surveyJobName);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('deleteSurveyParticipationRecord', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyParticipationService(dbConnection);

      const data = {
        projectParticipationId: 1
      };

      const repoStub = sinon
        .stub(SurveyParticipationRepository.prototype, 'deleteSurveyParticipationRecord')
        .resolves();

      const response = await service.deleteSurveyParticipationRecord(data.projectParticipationId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });
});
