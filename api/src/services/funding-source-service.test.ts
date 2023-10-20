import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  FundingSource,
  FundingSourceRepository,
  FundingSourceSupplementaryData,
  SurveyFundingSource,
  SurveyFundingSourceSupplementaryData
} from '../repositories/funding-source-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { FundingSourceService, ICreateFundingSource } from './funding-source-service';

chai.use(sinonChai);

describe('FundingSourceService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getFundingSources', () => {
    it('returns an array of funding source items', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult = [
        {
          funding_source_id: 1,
          name: 'name',
          start_date: '2020-01-01',
          end_date: '2020-01-01',
          description: 'description'
        }
      ];

      const getFundingSourcesStub = sinon
        .stub(FundingSourceRepository.prototype, 'getFundingSources')
        .resolves(expectedResult);

      const getFundingSourcesSupplementaryDataStub = sinon
        .stub(FundingSourceRepository.prototype, 'getFundingSourceSupplementaryData')
        .resolves({ survey_reference_count: 2, survey_reference_amount_total: 1 });

      const response = await fundingSourceService.getFundingSources({ name: 'name' });

      expect(getFundingSourcesStub).to.be.calledOnce;
      expect(getFundingSourcesSupplementaryDataStub).to.be.calledOnce;
      expect(response).to.eql([
        {
          funding_source_id: 1,
          name: 'name',
          start_date: '2020-01-01',
          end_date: '2020-01-01',
          description: 'description',
          survey_reference_count: 2,
          survey_reference_amount_total: 1
        }
      ]);
    });
  });

  describe('getFundingSource', () => {
    it('returns a single funding source', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult1: FundingSource & FundingSourceSupplementaryData = {
        funding_source_id: 1,
        name: 'name',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description',
        revision_count: 0,
        survey_reference_amount_total: 1,
        survey_reference_count: 500
      };

      const expectedResult2: (SurveyFundingSource | SurveyFundingSourceSupplementaryData)[] = [
        {
          survey_funding_source_id: 1,
          survey_id: 2,
          funding_source_id: 3,
          amount: 500,
          revision_count: 0,
          project_id: 1,
          survey_name: 'survey name'
        }
      ];

      const getFundingSourceStub = sinon
        .stub(FundingSourceRepository.prototype, 'getFundingSource')
        .resolves(expectedResult1);

      const getFundingSourceSurveyReferencesStub = sinon
        .stub(FundingSourceRepository.prototype, 'getFundingSourceSurveyReferences')
        .resolves(expectedResult2);

      const fundingSourceId = 1;

      const response = await fundingSourceService.getFundingSource(fundingSourceId);

      expect(getFundingSourceStub).to.be.calledOnceWith(fundingSourceId);
      expect(getFundingSourceSurveyReferencesStub).to.be.calledOnceWith(fundingSourceId);
      expect(response).to.eql({ funding_source: expectedResult1, funding_source_survey_references: expectedResult2 });
    });
  });

  describe('putFundingSource', () => {
    it('returns an array of funding source items', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult = { funding_source_id: 1 };

      const putFundingSourceStub = sinon
        .stub(FundingSourceRepository.prototype, 'putFundingSource')
        .resolves(expectedResult);

      const fundingSource: FundingSource = {
        funding_source_id: 1,
        name: 'name',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description',
        revision_count: 0
      };

      const response = await fundingSourceService.putFundingSource(fundingSource);

      expect(putFundingSourceStub).to.be.calledOnce;
      expect(response).to.eql(expectedResult);
    });
  });

  describe('postFundingSource', () => {
    it('returns a funding_source_id on success', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult = { funding_source_id: 1 };

      const postFundingSourceStub = sinon
        .stub(FundingSourceRepository.prototype, 'postFundingSource')
        .resolves(expectedResult);

      const fundingSource: ICreateFundingSource = {
        name: 'name',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description'
      };

      const response = await fundingSourceService.postFundingSource(fundingSource);

      expect(postFundingSourceStub).to.be.calledOnce;
      expect(response).to.eql(expectedResult);
    });
  });

  describe('deleteFundingSource', () => {
    it('deletes a funding source and returns the id of the deleted record', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult = { funding_source_id: 1 };

      const deleteFundingSourceStub = sinon
        .stub(FundingSourceRepository.prototype, 'deleteFundingSource')
        .resolves(expectedResult);

      const fundingSourceId = 1;

      const response = await fundingSourceService.deleteFundingSource(fundingSourceId);

      expect(deleteFundingSourceStub).to.be.calledOnce;
      expect(response).to.eql(expectedResult);
    });
  });

  describe('getSurveyFundingSourceByFundingSourceId', () => {
    it('returns a funding source item', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult = {
        funding_source_id: 1,
        survey_funding_source_id: 1,
        survey_id: 1,
        amount: 1,
        revision_count: 1
      };

      const getSurveyFundingSourceByFundingSourceIdStub = sinon
        .stub(FundingSourceRepository.prototype, 'getSurveyFundingSourceByFundingSourceId')
        .resolves(expectedResult);

      const response = await fundingSourceService.getSurveyFundingSourceByFundingSourceId(1, 1);

      expect(getSurveyFundingSourceByFundingSourceIdStub).to.be.calledOnce;
      expect(response).to.eql(expectedResult);
    });
  });

  describe('getSurveyFundingSources', () => {
    it('returns an array of funding source items', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult = [
        {
          funding_source_id: 1,
          survey_funding_source_id: 1,
          survey_id: 1,
          amount: 1,
          revision_count: 1
        }
      ];

      const getSurveyFundingSourceByFundingSourceIdStub = sinon
        .stub(FundingSourceRepository.prototype, 'getSurveyFundingSources')
        .resolves(expectedResult);

      const response = await fundingSourceService.getSurveyFundingSources(1);

      expect(getSurveyFundingSourceByFundingSourceIdStub).to.be.calledOnce;
      expect(response).to.eql(expectedResult);
    });
  });

  describe('postSurveyFundingSource', () => {
    it('inserts new survey funding source', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const postFundingSourceStub = sinon.stub(FundingSourceRepository.prototype, 'postSurveyFundingSource').resolves();

      const response = await fundingSourceService.postSurveyFundingSource(1, 1, 100);

      expect(postFundingSourceStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('putSurveyFundingSource', () => {
    it('updates survey funding source', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const postFundingSourceStub = sinon.stub(FundingSourceRepository.prototype, 'putSurveyFundingSource').resolves();

      const response = await fundingSourceService.putSurveyFundingSource(1, 1, 100, 1);

      expect(postFundingSourceStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('deleteSurveyFundingSource', () => {
    it('deletes a survey funding source record', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const deleteFundingSourceStub = sinon
        .stub(FundingSourceRepository.prototype, 'deleteSurveyFundingSource')
        .resolves();

      const response = await fundingSourceService.deleteSurveyFundingSource(1, 1);

      expect(deleteFundingSourceStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });
});
