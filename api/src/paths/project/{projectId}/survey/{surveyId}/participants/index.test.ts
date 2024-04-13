import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../../../../../../constants/database';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SurveyParticipationService } from '../../../../../../services/survey-participation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as create_survey_participants from './index';
import * as get_survey_participants from './index';

chai.use(sinonChai);

describe('getSurveyParticipants', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveyId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = get_survey_participants.getSurveyParticipants();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `surveyId`');
    }
  });

  it('should catch and re-throw an error if SurveyParticipationService throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    sinon.stub(SurveyParticipationService.prototype, 'getSurveyParticipants').rejects(new Error('an error'));

    try {
      const requestHandler = get_survey_participants.getSurveyParticipants();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should return participants on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1'
    };

    sinon.stub(SurveyParticipationService.prototype, 'getSurveyParticipants').resolves([
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

    const requestHandler = get_survey_participants.getSurveyParticipants();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({
      participants: [
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
      ]
    });
  });
});

describe('createSurveyParticipants', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      participants: [[1, 1, 'job']]
    },
    params: {
      surveyId: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveyId in the param', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create_survey_participants.createSurveyParticipants();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `surveyId`');
    }
  });

  it('should throw a 400 error when no participants in the request body', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create_survey_participants.createSurveyParticipants();
      await result(
        { ...sampleReq, body: { ...sampleReq.body, participants: [] } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param `participants`');
    }
  });

  it('should work', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const insertSurveyParticipantStub = sinon
      .stub(SurveyParticipationService.prototype, 'insertSurveyParticipant')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1'
    };

    mockReq.body = {
      participants: [[1, 1, 'job']]
    };

    const requestHandler = get_survey_participants.createSurveyParticipants();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(insertSurveyParticipantStub).to.have.been.calledOnce;
  });
});
