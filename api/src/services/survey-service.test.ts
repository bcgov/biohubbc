import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PutSurveyObject } from '../models/survey-update';
import { getMockDBConnection } from '../__mocks__/db';
import { SurveyService } from './survey-service';

chai.use(sinonChai);

describe('SurveyService', () => {
  describe('updateSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('updates nothing when no data provided', async () => {
      const dbConnectionObj = getMockDBConnection();

      const updateSurveyDetailsDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyDetailsData').resolves();
      const updateSurveyVantageCodesDataStub = sinon
        .stub(SurveyService.prototype, 'updateSurveyVantageCodesData')
        .resolves();
      const updateSurveySpeciesDataStub = sinon.stub(SurveyService.prototype, 'updateSurveySpeciesData').resolves();
      const updateSurveyPermitDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyPermitData').resolves();
      const updateSurveyFundingDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyFundingData').resolves();
      const updateSurveyProprietorDataStub = sinon
        .stub(SurveyService.prototype, 'updateSurveyProprietorData')
        .resolves();

      const surveyService = new SurveyService(dbConnectionObj);

      const projectId = 1;
      const surveyId = 2;
      const putSurveyData = new PutSurveyObject(null);

      await surveyService.updateSurvey(projectId, surveyId, putSurveyData);

      expect(updateSurveyDetailsDataStub).not.to.have.been.called;
      expect(updateSurveyVantageCodesDataStub).not.to.have.been.called;
      expect(updateSurveySpeciesDataStub).not.to.have.been.called;
      expect(updateSurveyPermitDataStub).not.to.have.been.called;
      expect(updateSurveyFundingDataStub).not.to.have.been.called;
      expect(updateSurveyProprietorDataStub).not.to.have.been.called;
    });

    it('updates everything when all data provided', async () => {
      const dbConnectionObj = getMockDBConnection();

      const updateSurveyDetailsDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyDetailsData').resolves();
      const updateSurveyVantageCodesDataStub = sinon
        .stub(SurveyService.prototype, 'updateSurveyVantageCodesData')
        .resolves();
      const updateSurveySpeciesDataStub = sinon.stub(SurveyService.prototype, 'updateSurveySpeciesData').resolves();
      const updateSurveyPermitDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyPermitData').resolves();
      const updateSurveyFundingDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyFundingData').resolves();
      const updateSurveyProprietorDataStub = sinon
        .stub(SurveyService.prototype, 'updateSurveyProprietorData')
        .resolves();

      const surveyService = new SurveyService(dbConnectionObj);

      const projectId = 1;
      const surveyId = 2;
      const putSurveyData = new PutSurveyObject({
        survey_details: {},
        species: {},
        permit: {},
        funding: {},
        proprietor: {},
        purpose_and_methodology: {},
        location: {}
      });

      await surveyService.updateSurvey(projectId, surveyId, putSurveyData);

      expect(updateSurveyDetailsDataStub).to.have.been.calledOnce;
      expect(updateSurveyVantageCodesDataStub).to.have.been.calledOnce;
      expect(updateSurveySpeciesDataStub).to.have.been.calledOnce;
      expect(updateSurveyPermitDataStub).to.have.been.calledOnce;
      expect(updateSurveyFundingDataStub).to.have.been.calledOnce;
      expect(updateSurveyProprietorDataStub).to.have.been.calledOnce;
    });
  });

  describe('getLatestSurveyOccurrenceSubmission', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets latest survey submission', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const surveyId = 1;

      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getLatestSurveyOccurrenceSubmission(surveyId);

      expect(response).to.eql({ id: 123 });
    });
  });
});
