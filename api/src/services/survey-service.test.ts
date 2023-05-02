import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MESSAGE_CLASS_NAME, SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { ApiExecuteSQLError, ApiGeneralError } from '../errors/api-error';
import { GetReportAttachmentsData } from '../models/project-view';
import { PostProprietorData, PostSurveyObject } from '../models/survey-create';
import { PutSurveyObject, PutSurveyPermitData } from '../models/survey-update';
import {
  GetAncillarySpeciesData,
  GetAttachmentsData,
  GetFocalSpeciesData,
  GetSurveyData,
  GetSurveyFundingSources,
  GetSurveyLocationData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData
} from '../models/survey-view';
import { IPermitModel } from '../repositories/permit-repository';
import {
  IGetLatestSurveyOccurrenceSubmission,
  IGetSpeciesData,
  SurveyRepository
} from '../repositories/survey-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { HistoryPublishService } from './history-publish-service';
import { PermitService } from './permit-service';
import { PlatformService } from './platform-service';
import { SurveyService } from './survey-service';
import { TaxonomyService } from './taxonomy-service';

chai.use(sinonChai);

describe('SurveyService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSurveyById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('calls all functions and returns survey object', async () => {
      const dbConnectionObj = getMockDBConnection();

      const surveyService = new SurveyService(dbConnectionObj);

      const getSurveyDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyData')
        .resolves(({ data: 'surveyData' } as unknown) as any);
      const getSpeciesDataStub = sinon
        .stub(SurveyService.prototype, 'getSpeciesData')
        .resolves(({ data: 'speciesData' } as unknown) as any);
      const getPermitDataStub = sinon
        .stub(SurveyService.prototype, 'getPermitData')
        .resolves(({ data: 'permitData' } as unknown) as any);
      const getSurveyFundingSourcesDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyFundingSourcesData')
        .resolves(({ data: 'fundingData' } as unknown) as any);
      const getSurveyPurposeAndMethodologyStub = sinon
        .stub(SurveyService.prototype, 'getSurveyPurposeAndMethodology')
        .resolves(({ data: 'purposeAndMethodologyData' } as unknown) as any);
      const getSurveyProprietorDataForViewStub = sinon
        .stub(SurveyService.prototype, 'getSurveyProprietorDataForView')
        .resolves(({ data: 'proprietorData' } as unknown) as any);
      const getSurveyLocationDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyLocationData')
        .resolves(({ data: 'locationData' } as unknown) as any);

      const response = await surveyService.getSurveyById(1);

      expect(getSurveyDataStub).to.be.calledOnce;
      expect(getSpeciesDataStub).to.be.calledOnce;
      expect(getPermitDataStub).to.be.calledOnce;
      expect(getSurveyFundingSourcesDataStub).to.be.calledOnce;
      expect(getSurveyPurposeAndMethodologyStub).to.be.calledOnce;
      expect(getSurveyProprietorDataForViewStub).to.be.calledOnce;
      expect(getSurveyLocationDataStub).to.be.calledOnce;

      expect(response).to.eql({
        survey_details: { data: 'surveyData' },
        species: { data: 'speciesData' },
        permit: { data: 'permitData' },
        purpose_and_methodology: { data: 'purposeAndMethodologyData' },
        funding: { data: 'fundingData' },
        proprietor: { data: 'proprietorData' },
        location: { data: 'locationData' }
      });
    });
  });

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

      const surveyId = 2;
      const putSurveyData = new PutSurveyObject(null);

      await surveyService.updateSurvey(surveyId, putSurveyData);

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

      await surveyService.updateSurvey(surveyId, putSurveyData);

      expect(updateSurveyDetailsDataStub).to.have.been.calledOnce;
      expect(updateSurveyVantageCodesDataStub).to.have.been.calledOnce;
      expect(updateSurveySpeciesDataStub).to.have.been.calledOnce;
      expect(updateSurveyPermitDataStub).to.have.been.calledOnce;
      expect(updateSurveyFundingDataStub).to.have.been.calledOnce;
      expect(updateSurveyProprietorDataStub).to.have.been.calledOnce;
    });
  });

  describe('getLatestSurveyOccurrenceSubmission', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = ({ id: 1 } as unknown) as IGetLatestSurveyOccurrenceSubmission;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getLatestSurveyOccurrenceSubmission').resolves(data);

      const response = await service.getLatestSurveyOccurrenceSubmission(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getSurveyIdsByProjectId', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = [{ id: 1 }];

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSurveyIdsByProjectId').resolves(data);

      const response = await service.getSurveyIdsByProjectId(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getSurveySupplementaryDataById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches and returns all supplementary data', async () => {
      const getSurveyMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecord')
        .resolves(({ survey_metadata_publish_id: 5 } as unknown) as any);

      const surveyService = new SurveyService(getMockDBConnection());

      const response = await surveyService.getSurveySupplementaryDataById(1);

      expect(getSurveyMetadataPublishRecordStub).to.be.calledOnce;

      expect(response).to.eql({
        survey_metadata_publish: { survey_metadata_publish_id: 5 }
      });
    });
  });

  describe('getSurveyData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = new GetSurveyData({ id: 1 });

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSurveyData').resolves(data);

      const response = await service.getSurveyData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getSpeciesData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = ({ id: 1 } as unknown) as IGetSpeciesData;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSpeciesData').resolves([data]);

      const serviceStub1 = sinon
        .stub(TaxonomyService.prototype, 'getSpeciesFromIds')
        .resolves([{ id: '1', label: 'string' }]);

      const response = await service.getSpeciesData(1);

      expect(repoStub).to.be.calledOnce;
      expect(serviceStub1).to.be.calledTwice;
      expect(response).to.eql({
        ...new GetFocalSpeciesData([{ id: '1', label: 'string' }]),
        ...new GetAncillarySpeciesData([{ id: '1', label: 'string' }])
      });
    });
  });

  describe('getPermitData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockPermitResponse: IPermitModel[] = [
        {
          permit_id: 1,
          survey_id: 1,
          number: 'abc',
          type: 'Fisheries',
          create_date: '2022-02-02',
          create_user: 4,
          update_date: '2022-02-02',
          update_user: 4,
          revision_count: 1
        }
      ];

      const mockDBConnection = getMockDBConnection();
      const surveyService = new SurveyService(mockDBConnection);

      const getPermitBySurveyIdStub = sinon
        .stub(PermitService.prototype, 'getPermitBySurveyId')
        .resolves(mockPermitResponse);

      const response = await surveyService.getPermitData(1);

      expect(getPermitBySurveyIdStub).to.be.calledOnceWith(1);
      expect(response).to.eql({ permits: [{ permit_id: 1, permit_number: 'abc', permit_type: 'Fisheries' }] });
    });
  });

  describe('getSurveyPurposeAndMethodology', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = new GetSurveyPurposeAndMethodologyData({ id: 1 });

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSurveyPurposeAndMethodology').resolves(data);

      const response = await service.getSurveyPurposeAndMethodology(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getSurveyFundingSourcesData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = new GetSurveyFundingSources([{ id: 1 }]);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSurveyFundingSourcesData').resolves(data);

      const response = await service.getSurveyFundingSourcesData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getSurveyProprietorDataForView', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = new GetSurveyProprietorData([{ id: 1 }]);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSurveyProprietorDataForView').resolves(data);

      const response = await service.getSurveyProprietorDataForView(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getSurveyLocationData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = new GetSurveyLocationData([{ id: 1 }]);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSurveyLocationData').resolves(data);

      const response = await service.getSurveyLocationData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getOccurrenceSubmission', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = { occurrence_submission_id: 1 };

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getOccurrenceSubmission').resolves(data);

      const response = await service.getOccurrenceSubmission(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getLatestSurveyOccurrenceSubmission', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = ({ id: 1 } as unknown) as IGetLatestSurveyOccurrenceSubmission;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getLatestSurveyOccurrenceSubmission').resolves(data);

      const response = await service.getLatestSurveyOccurrenceSubmission(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getSurveySummarySubmission', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = { survey_summary_submission_id: 1 };

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSurveySummarySubmission').resolves(data);

      const response = await service.getSurveySummarySubmission(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getAttachmentsData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = ({ id: 1 } as unknown) as GetAttachmentsData;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getAttachmentsData').resolves(data);

      const response = await service.getAttachmentsData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getReportAttachmentsData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = ({ id: 1 } as unknown) as GetReportAttachmentsData;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getReportAttachmentsData').resolves(data);

      const response = await service.getReportAttachmentsData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('insertSurveyData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = 1;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'insertSurveyData').resolves(data);

      const response = await service.insertSurveyData(1, ({ id: 1 } as unknown) as PostSurveyObject);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('insertFocalSpecies', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = 1;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'insertFocalSpecies').resolves(data);

      const response = await service.insertFocalSpecies(1, 1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('insertAncillarySpecies', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = 1;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'insertAncillarySpecies').resolves(data);

      const response = await service.insertAncillarySpecies(1, 1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('insertVantageCodes', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = 1;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'insertVantageCodes').resolves(data);

      const response = await service.insertVantageCodes(1, 1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('insertSurveyProprietor', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = 1;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'insertSurveyProprietor').resolves(data);

      const response = await service.insertSurveyProprietor(({ id: 1 } as unknown) as PostProprietorData, 1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('insertOrAssociatePermitToSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('calls associate Survey to permit', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub1 = sinon.stub(SurveyRepository.prototype, 'associateSurveyToPermit').resolves();
      const repoStub2 = sinon.stub(SurveyRepository.prototype, 'insertSurveyPermit').resolves();

      const response = await service.insertOrAssociatePermitToSurvey(1, 1, 1, 'string', '');

      expect(repoStub1).to.be.calledOnce;
      expect(repoStub2).not.to.be.called;
      expect(response).to.eql(undefined);
    });

    it('inserts new survey', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub1 = sinon.stub(SurveyRepository.prototype, 'associateSurveyToPermit').resolves();
      const repoStub2 = sinon.stub(SurveyRepository.prototype, 'insertSurveyPermit').resolves();

      const response = await service.insertOrAssociatePermitToSurvey(1, 1, 1, 'string', 'string');

      expect(repoStub1).not.to.be.called;
      expect(repoStub2).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('insertSurveyFundingSource', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'insertSurveyFundingSource').resolves();

      const response = await service.insertSurveyFundingSource(1, 1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyDetailsData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws api error if response is null', async () => {
      const mockDBConnection = getMockDBConnection({ knex: async () => (undefined as unknown) as any });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.updateSurveyDetailsData(1, ({ survey_details: 'details' } as unknown) as PutSurveyObject);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to update survey data');
      }
    });

    it('returns data if response is not null', async () => {
      const mockQueryResponse = ({ response: 'something', rowCount: 1 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ knex: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveyDetailsData(1, ({
        survey_details: 'details'
      } as unknown) as PutSurveyObject);

      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveySpeciesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if response is not null', async () => {
      sinon.stub(SurveyService.prototype, 'deleteSurveySpeciesData').resolves();
      sinon.stub(SurveyService.prototype, 'insertFocalSpecies').resolves(1);
      sinon.stub(SurveyService.prototype, 'insertAncillarySpecies').resolves(1);

      const mockQueryResponse = ({ response: 'something', rowCount: 1 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ knex: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveySpeciesData(1, ({
        survey_details: 'details',
        species: { focal_species: [1], ancillary_species: [1] }
      } as unknown) as PutSurveyObject);

      expect(response).to.eql([1, 1]);
    });
  });

  describe('deleteSurveySpeciesData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'deleteSurveySpeciesData').resolves();

      const response = await service.deleteSurveySpeciesData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyPermitData', () => {
    afterEach(() => {
      sinon.restore();
    });

    describe('with no existing permits', () => {
      it('handles permit deletes/updates/creates', async () => {
        const mockDBConnection = getMockDBConnection();

        const getPermitBySurveyIdStub = sinon.stub(PermitService.prototype, 'getPermitBySurveyId').resolves([]);
        const deleteSurveyPermitStub = sinon.stub(PermitService.prototype, 'deleteSurveyPermit').resolves();
        const updateSurveyPermitStub = sinon.stub(PermitService.prototype, 'updateSurveyPermit').resolves();
        const createSurveyPermitStub = sinon.stub(PermitService.prototype, 'createSurveyPermit').resolves();

        const mockPutSurveyObject = {
          permit: {
            permits: [
              {
                permit_id: 2,
                permit_number: '1111',
                permit_type: 'type1'
              },
              {
                permit_number: '2222',
                permit_type: 'type2'
              }
            ]
          } as PutSurveyPermitData
        } as PutSurveyObject;

        const surveyService = new SurveyService(mockDBConnection);

        await surveyService.updateSurveyPermitData(1, mockPutSurveyObject);

        expect(getPermitBySurveyIdStub).to.have.been.calledOnceWith(1);

        expect(deleteSurveyPermitStub).not.to.have.been.called;

        expect(updateSurveyPermitStub).to.have.been.calledOnceWith(1, 2, '1111', 'type1');

        expect(createSurveyPermitStub).to.have.been.calledOnceWith(1, '2222', 'type2');
      });
    });

    describe('with existing permits', () => {
      it('handles permit deletes/updates/creates', async () => {
        const mockDBConnection = getMockDBConnection();

        const mockExistingPermits = [{ permit_id: 3 }, { permit_id: 4 }] as IPermitModel[];

        const getPermitBySurveyIdStub = sinon
          .stub(PermitService.prototype, 'getPermitBySurveyId')
          .resolves(mockExistingPermits);
        const deleteSurveyPermitStub = sinon.stub(PermitService.prototype, 'deleteSurveyPermit').resolves();
        const updateSurveyPermitStub = sinon.stub(PermitService.prototype, 'updateSurveyPermit').resolves();
        const createSurveyPermitStub = sinon.stub(PermitService.prototype, 'createSurveyPermit').resolves();

        const mockPutSurveyObject = {
          permit: {
            permits: [
              {
                permit_id: 2,
                permit_number: '1111',
                permit_type: 'type1'
              },
              {
                permit_number: '2222',
                permit_type: 'type2'
              }
            ]
          } as PutSurveyPermitData
        } as PutSurveyObject;

        const surveyService = new SurveyService(mockDBConnection);

        await surveyService.updateSurveyPermitData(1, mockPutSurveyObject);

        expect(getPermitBySurveyIdStub).to.have.been.calledOnceWith(1);

        expect(deleteSurveyPermitStub).to.have.callCount(2);
        expect(deleteSurveyPermitStub).to.have.been.calledWith(1, 3);
        expect(deleteSurveyPermitStub).to.have.been.calledWith(1, 4);

        expect(updateSurveyPermitStub).to.have.been.calledOnceWith(1, 2, '1111', 'type1');

        expect(createSurveyPermitStub).to.have.been.calledOnceWith(1, '2222', 'type2');
      });
    });
  });

  describe('unassociatePermitFromSurvey', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'unassociatePermitFromSurvey').resolves();

      const response = await service.unassociatePermitFromSurvey(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyFundingData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if response is not null', async () => {
      sinon.stub(SurveyService.prototype, 'deleteSurveyFundingSourcesData').resolves(undefined);
      sinon.stub(SurveyService.prototype, 'insertSurveyFundingSource').resolves(undefined);

      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveyFundingData(1, ({
        permit: { permit_number: '1', permit_type: 'type' },
        funding: { funding_sources: [1] }
      } as unknown) as PutSurveyObject);

      expect(response).to.eql([undefined]);
    });
  });

  describe('deleteSurveyFundingSourcesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'deleteSurveyFundingSourcesData').resolves();

      const response = await service.deleteSurveyFundingSourcesData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyProprietorData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns undefined', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyService.prototype, 'deleteSurveyProprietorData').resolves();

      const response = await service.updateSurveyProprietorData(1, ({
        proprietor: { survey_data_proprietary: false }
      } as unknown) as PutSurveyObject);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });

    it('returns and calls insert', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyService.prototype, 'deleteSurveyProprietorData').resolves();
      const serviceStub = sinon.stub(SurveyService.prototype, 'insertSurveyProprietor').resolves();

      const response = await service.updateSurveyProprietorData(1, ({
        proprietor: { survey_data_proprietary: 'string' }
      } as unknown) as PutSurveyObject);

      expect(repoStub).to.be.calledOnce;
      expect(serviceStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('deleteSurveyProprietorData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'deleteSurveyProprietorData').resolves();

      const response = await service.deleteSurveyProprietorData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyVantageCodesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns [] if not vantage_code_ids is given', async () => {
      sinon.stub(SurveyService.prototype, 'deleteSurveyVantageCodes').resolves();

      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveyVantageCodesData(1, ({
        permit: { permit_number: '1', permit_type: 'type' },
        funding: { funding_sources: [1] },
        purpose_and_methodology: { vantage_code_ids: undefined }
      } as unknown) as PutSurveyObject);

      expect(response).to.eql([]);
    });

    it('returns data if response is not null', async () => {
      sinon.stub(SurveyService.prototype, 'deleteSurveyVantageCodes').resolves();
      sinon.stub(SurveyService.prototype, 'insertVantageCodes').resolves(1);

      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveyVantageCodesData(1, ({
        permit: { permit_number: '1', permit_type: 'type' },
        funding: { funding_sources: [1] },
        proprietor: { survey_data_proprietary: 'asd' },
        purpose_and_methodology: { vantage_code_ids: [1] }
      } as unknown) as PutSurveyObject);

      expect(response).to.eql([1]);
    });
  });

  describe('deleteSurveyVantageCodes', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'deleteSurveyVantageCodes').resolves();

      const response = await service.deleteSurveyVantageCodes(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('getOccurrenceSubmissionMessages', () => {
    it('should return empty array if no messages are found', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getOccurrenceSubmissionMessages').resolves([]);

      const response = await service.getOccurrenceSubmissionMessages(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([]);
    });

    it('should successfully group messages by message type', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getOccurrenceSubmissionMessages').resolves([
        {
          id: 1,
          type: SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER,
          status: SUBMISSION_STATUS_TYPE.FAILED_VALIDATION,
          class: MESSAGE_CLASS_NAME.ERROR,
          message: 'message 1'
        },
        {
          id: 2,
          type: SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER,
          status: SUBMISSION_STATUS_TYPE.FAILED_VALIDATION,
          class: MESSAGE_CLASS_NAME.ERROR,
          message: 'message 2'
        },
        {
          id: 3,
          type: SUBMISSION_MESSAGE_TYPE.MISSING_RECOMMENDED_HEADER,
          status: SUBMISSION_STATUS_TYPE.SUBMITTED,
          class: MESSAGE_CLASS_NAME.WARNING,
          message: 'message 3'
        },
        {
          id: 4,
          type: SUBMISSION_MESSAGE_TYPE.MISCELLANEOUS,
          status: SUBMISSION_STATUS_TYPE.SUBMITTED,
          class: MESSAGE_CLASS_NAME.NOTICE,
          message: 'message 4'
        }
      ]);

      const response = await service.getOccurrenceSubmissionMessages(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([
        {
          severityLabel: 'Error',
          messageTypeLabel: 'Duplicate Header',
          messageStatus: 'Failed to validate',
          messages: [
            { id: 1, message: 'message 1' },
            { id: 2, message: 'message 2' }
          ]
        },
        {
          severityLabel: 'Warning',
          messageTypeLabel: 'Missing Recommended Header',
          messageStatus: 'Submitted',
          messages: [{ id: 3, message: 'message 3' }]
        },
        {
          severityLabel: 'Notice',
          messageTypeLabel: 'Miscellaneous',
          messageStatus: 'Submitted',
          messages: [{ id: 4, message: 'message 4' }]
        }
      ]);
    });
  });

  describe('insertSurveyOccurrenceSubmission', () => {
    it('should return submissionId upon success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon
        .stub(SurveyRepository.prototype, 'insertSurveyOccurrenceSubmission')
        .resolves({ submissionId: 1 });

      const response = await service.insertSurveyOccurrenceSubmission({
        surveyId: 1,
        source: 'Test'
      });

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ submissionId: 1 });
    });

    it('should throw an error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      sinon
        .stub(SurveyRepository.prototype, 'insertSurveyOccurrenceSubmission')
        .throws(new ApiExecuteSQLError('Failed to insert survey occurrence submission'));

      try {
        await service.insertSurveyOccurrenceSubmission({
          surveyId: 1,
          source: 'Test'
        });
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to insert survey occurrence submission');
      }
    });
  });

  describe('updateSurveyOccurrenceSubmission', () => {
    it('should return submissionId upon success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon
        .stub(SurveyRepository.prototype, 'updateSurveyOccurrenceSubmission')
        .resolves({ submissionId: 1 });

      const response = await service.updateSurveyOccurrenceSubmission({ submissionId: 1 });

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ submissionId: 1 });
    });

    it('should throw an error', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      sinon
        .stub(SurveyRepository.prototype, 'updateSurveyOccurrenceSubmission')
        .throws(new ApiExecuteSQLError('Failed to update survey occurrence submission'));

      try {
        await service.updateSurveyOccurrenceSubmission({ submissionId: 1 });
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to update survey occurrence submission');
      }
    });
  });

  describe('deleteOccurrenceSubmission', () => {
    it('should return 1 upon success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'deleteOccurrenceSubmission').resolves(1);

      const response = await service.deleteOccurrenceSubmission(2);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(1);
    });

    it('should throw an error upon failure', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      sinon
        .stub(SurveyRepository.prototype, 'deleteOccurrenceSubmission')
        .throws(new ApiExecuteSQLError('Failed to delete survey occurrence submission'));

      try {
        await service.deleteOccurrenceSubmission(2);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to delete survey occurrence submission');
      }
    });
  });

  describe('createSurveyAndUploadMetadataToBioHub', () => {
    it('returns projectId on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const projectId = 1;
      const surveyId = 2;
      const surveyData = (null as unknown) as PostSurveyObject;

      const createSurveyStub = sinon.stub(SurveyService.prototype, 'createSurvey').resolves(surveyId);
      const submitSurveyDwCMetadataToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyDwCMetadataToBioHub')
        .resolves();
      const submitProjectDwCMetadataToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitProjectDwCMetadataToBioHub')
        .resolves();

      const response = await service.createSurveyAndUploadMetadataToBioHub(projectId, surveyData);

      expect(createSurveyStub).to.be.calledOnce;
      expect(submitSurveyDwCMetadataToBioHubStub).to.be.calledOnceWith(surveyId);
      expect(submitProjectDwCMetadataToBioHubStub).to.be.calledOnceWith(projectId);
      expect(response).to.eql(surveyId);
    });
  });

  describe('updateSurveyAndUploadMetadataToBiohub', () => {
    it('successfully updates survey and submits data to BioHub', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const surveyId = 1;
      const projectId = 2;
      const surveyData = (null as unknown) as PutSurveyObject;

      const updateSurveyStub = sinon.stub(SurveyService.prototype, 'updateSurvey').resolves();
      const submitSurveyDwCMetadataToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitSurveyDwCMetadataToBioHub')
        .resolves();
      const submitProjectDwCMetadataToBioHubStub = sinon
        .stub(PlatformService.prototype, 'submitProjectDwCMetadataToBioHub')
        .resolves();

      const response = await service.updateSurveyAndUploadMetadataToBiohub(projectId, surveyId, surveyData);

      expect(updateSurveyStub).to.be.calledOnceWith(surveyId, surveyData);
      expect(submitSurveyDwCMetadataToBioHubStub).to.be.calledOnceWith(surveyId);
      expect(submitProjectDwCMetadataToBioHubStub).to.be.calledOnceWith(projectId);
      expect(response).to.eql(undefined);
    });
  });

  describe('getSurveyHasUnpublishedContent', () => {
    it('returns false when survey has no content or when everything is published', async () => {
      const dbConnection = getMockDBConnection();
      //const history_service = new HistoryPublishService(dbConnection);
      const survey_service = new SurveyService(dbConnection);

      const hasUnpublishedAttachmentsStub = sinon
        .stub(HistoryPublishService.prototype, 'hasUnpublishedSurveyAttachments')
        .resolves(false);

      const hasUnpublishedReportsStub = sinon
        .stub(HistoryPublishService.prototype, 'hasUnpublishedSurveyReports')
        .resolves(false);

      const hasUnpublishedObservationStub = sinon
        .stub(HistoryPublishService.prototype, 'hasUnpublishedObservation')
        .resolves(false);

      const hasUnpublishedSummaryResultsStub = sinon
        .stub(HistoryPublishService.prototype, 'hasUnpublishedSummaryResults')
        .resolves(false);

      const response = await survey_service.doesSurveyHaveUnpublishedContent(1);

      expect(hasUnpublishedAttachmentsStub).to.be.calledOnce;
      expect(hasUnpublishedReportsStub).to.be.calledOnce;
      expect(hasUnpublishedObservationStub).to.be.calledOnce;
      expect(hasUnpublishedSummaryResultsStub).to.be.calledOnce;
      expect(response).to.eql(false);
    });

    it('returns true when survey any content (observation, summary result, attachment or report) is unsubmitted ', async () => {
      const dbConnection = getMockDBConnection();
      //const history_service = new HistoryPublishService(dbConnection);
      const survey_service = new SurveyService(dbConnection);

      const hasUnpublishedAttachmentsStub = sinon
        .stub(HistoryPublishService.prototype, 'hasUnpublishedSurveyAttachments')
        .resolves(false);

      const hasUnpublishedReportsStub = sinon
        .stub(HistoryPublishService.prototype, 'hasUnpublishedSurveyReports')
        .resolves(false);

      const hasUnpublishedObservationStub = sinon
        .stub(HistoryPublishService.prototype, 'hasUnpublishedObservation')
        .resolves(false);

      const hasUnpublishedSummaryResultsStub = sinon
        .stub(HistoryPublishService.prototype, 'hasUnpublishedSummaryResults')
        .resolves(true);

      const response = await survey_service.doesSurveyHaveUnpublishedContent(1);

      expect(hasUnpublishedAttachmentsStub).to.be.calledOnce;
      expect(hasUnpublishedReportsStub).to.be.calledOnce;
      expect(hasUnpublishedObservationStub).to.be.calledOnce;
      expect(hasUnpublishedSummaryResultsStub).to.be.calledOnce;
      expect(response).to.eql(true);
    });
  });
});
