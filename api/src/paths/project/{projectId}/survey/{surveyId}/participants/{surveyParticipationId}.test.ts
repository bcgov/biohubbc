import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SurveyParticipationService } from '../../../../../../services/survey-participation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as delete_survey_participant from './{surveyParticipationId}';
import * as update_survey_participant from './{surveyParticipationId}';

chai.use(sinonChai);

describe('updateSurveyParticipantRole', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when the user cannot update the survey participant role', async () => {
    const fakeDB = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(fakeDB);

    const expectedError = new Error('cannot process request');
    const updateSurveyParticipantStub = sinon
      .stub(SurveyParticipationService.prototype, 'updateSurveyParticipantJob')
      .rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;

    const { mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const result = update_survey_participant.updateSurveyParticipantRole();
      await result(sampleReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(updateSurveyParticipantStub).to.have.been.calledOnce;
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should update the survey participant role', async () => {
    const fakeDB = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(fakeDB);

    const updateSurveyParticipantStub = sinon
      .stub(SurveyParticipationService.prototype, 'updateSurveyParticipantJob')
      .resolves();

    const sampleReq = {
      keycloak_token: {},
      body: { surveyJobName: 'test' },
      params: {
        projectId: 1,
        surveyId: 2,
        surveyParticipationId: 3
      }
    } as any;

    const { mockRes, mockNext } = getRequestHandlerMocks();

    const result = update_survey_participant.updateSurveyParticipantRole();
    await result(sampleReq, mockRes, mockNext);

    expect(updateSurveyParticipantStub).to.have.been.calledOnce;
  });
});

describe('deleteSurveyParticipationRecord', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when the user cannot delete the project participant', async () => {
    const fakeDB = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(fakeDB);

    const expectedError = new Error('cannot process request');
    const deleteSurveyParticipationRecordStub = sinon
      .stub(SurveyParticipationService.prototype, 'deleteSurveyParticipationRecord')
      .rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;

    const { mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const result = delete_survey_participant.deleteSurveyParticipant();
      await result(sampleReq, mockRes, mockNext);

      expect.fail();
    } catch (actualError) {
      expect(deleteSurveyParticipationRecordStub).to.have.been.calledOnce;
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should delete the project participant', async () => {
    const fakeDB = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(fakeDB);

    const deleteSurveyParticipationRecordStub = sinon
      .stub(SurveyParticipationService.prototype, 'deleteSurveyParticipationRecord')
      .resolves();

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;
    const { mockRes, mockNext } = getRequestHandlerMocks();

    const result = delete_survey_participant.deleteSurveyParticipant();
    await result(sampleReq, mockRes, mockNext);

    expect(deleteSurveyParticipationRecordStub).to.have.been.calledOnce;
  });
});
