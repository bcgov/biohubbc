import chai, { expect } from 'chai';
import { Feature } from 'geojson';
import { flatten } from 'lodash';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiGeneralError } from '../errors/api-error';
import { GetReportAttachmentsData } from '../models/project-view';
import { PostProprietorData, PostSurveyObject, TaxonomyWithEcologicalUnits } from '../models/survey-create';
import { PostSurveyLocationData, PutSurveyObject, PutSurveyPermitData } from '../models/survey-update';
import {
  GetAttachmentsData,
  GetFocalSpeciesData,
  GetSurveyData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData,
  SurveyObject
} from '../models/survey-view';
import { FundingSourceRepository } from '../repositories/funding-source-repository';
import { IPermitModel } from '../repositories/permit-repository';
import { SurveyLocationRecord, SurveyLocationRepository } from '../repositories/survey-location-repository';
import {
  ISurveyProprietorModel,
  SurveyRecord,
  SurveyRepository,
  SurveyTypeRecord
} from '../repositories/survey-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { HistoryPublishService } from './history-publish-service';
import { PermitService } from './permit-service';
import { PlatformService } from './platform-service';
import { RegionService } from './region-service';
import { SiteSelectionStrategyService } from './site-selection-strategy-service';
import { SurveyBlockService } from './survey-block-service';
import { SurveyLocationService } from './survey-location-service';
import { SurveyParticipationService } from './survey-participation-service';
import { SurveyService } from './survey-service';

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
        .resolves({ data: 'surveyData' } as unknown as any);
      const getSpeciesDataStub = sinon
        .stub(SurveyService.prototype, 'getSpeciesData')
        .resolves({ data: 'speciesData' } as unknown as any);
      const getPermitDataStub = sinon
        .stub(SurveyService.prototype, 'getPermitData')
        .resolves({ data: 'permitData' } as unknown as any);
      const getSurveyFundingSourceDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyFundingSourceData')
        .resolves({ data: 'fundingSourceData' } as unknown as any);
      const getSurveyPurposeAndMethodologyStub = sinon
        .stub(SurveyService.prototype, 'getSurveyPurposeAndMethodology')
        .resolves({ data: 'purposeAndMethodologyData' } as unknown as any);
      const getSurveyProprietorDataForViewStub = sinon
        .stub(SurveyService.prototype, 'getSurveyProprietorDataForView')
        .resolves({ data: 'proprietorData' } as unknown as any);
      const getSurveyLocationsDataStub = sinon.stub(SurveyService.prototype, 'getSurveyLocationsData').resolves([]);
      const getSurveyParticipantsStub = sinon
        .stub(SurveyParticipationService.prototype, 'getSurveyParticipants')
        .resolves([{ data: 'participantData' } as any]);
      const getSurveyBlockStub = sinon.stub(SurveyBlockService.prototype, 'getSurveyBlocksForSurveyId').resolves([]);
      const getSiteSelectionDataStub = sinon
        .stub(SiteSelectionStrategyService.prototype, 'getSiteSelectionDataBySurveyId')
        .resolves({ strategies: [], stratums: [] });

      const getSurveyPartnershipsDataStub = sinon.stub(SurveyService.prototype, 'getSurveyPartnershipsData').resolves({
        indigenous_partnerships: [],
        stakeholder_partnerships: []
      });

      const response = await surveyService.getSurveyById(1);

      expect(getSurveyDataStub).to.be.calledOnce;
      expect(getSpeciesDataStub).to.be.calledOnce;
      expect(getPermitDataStub).to.be.calledOnce;
      expect(getSurveyFundingSourceDataStub).to.be.calledOnce;
      expect(getSurveyPurposeAndMethodologyStub).to.be.calledOnce;
      expect(getSurveyProprietorDataForViewStub).to.be.calledOnce;
      expect(getSurveyLocationsDataStub).to.be.calledOnce;
      expect(getSurveyParticipantsStub).to.be.calledOnce;
      expect(getSurveyPartnershipsDataStub).to.be.calledOnce;
      expect(getSurveyBlockStub).to.be.calledOnce;
      expect(getSiteSelectionDataStub).to.be.calledOnce;

      expect(response).to.eql({
        survey_details: { data: 'surveyData' },
        species: { data: 'speciesData' },
        permit: { data: 'permitData' },
        funding_sources: { data: 'fundingSourceData' },
        purpose_and_methodology: { data: 'purposeAndMethodologyData' },
        proprietor: { data: 'proprietorData' },
        partnerships: {
          indigenous_partnerships: [],
          stakeholder_partnerships: []
        },
        participants: [{ data: 'participantData' } as any],
        locations: [],
        site_selection: { stratums: [], strategies: [] },
        blocks: []
      });
    });
  });

  describe('getSurveyCountByProjectId', () => {
    it('should return the survey count successfully', async () => {
      const dbConnectionObj = getMockDBConnection();

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSurveyCountByProjectId').resolves(20);
      const surveyService = new SurveyService(dbConnectionObj);
      const response = await surveyService.getSurveyCountByProjectId(1001);

      expect(repoStub).to.be.calledOnceWith(1001);
      expect(response).to.equal(20);
    });
  });

  describe('updateSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('updates nothing when no data provided', async () => {
      const dbConnectionObj = getMockDBConnection();

      const updateSurveyDetailsDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyDetailsData').resolves();
      const updateSurveySpeciesDataStub = sinon.stub(SurveyService.prototype, 'updateSurveySpeciesData').resolves();
      const updateSurveyPermitDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyPermitData').resolves();
      const upsertSurveyFundingSourceDataStub = sinon
        .stub(SurveyService.prototype, 'upsertSurveyFundingSourceData')
        .resolves();
      const updateSurveyProprietorDataStub = sinon
        .stub(SurveyService.prototype, 'updateSurveyProprietorData')
        .resolves();
      const upsertSurveyParticipantDataStub = sinon
        .stub(SurveyService.prototype, 'upsertSurveyParticipantData')
        .resolves();
      sinon.stub(SurveyBlockService.prototype, 'upsertSurveyBlocks').resolves();
      const updateSurveyStratumsStub = sinon
        .stub(SiteSelectionStrategyService.prototype, 'updateSurveyStratums')
        .resolves();
      const insertUpdateDeleteSurveyLocationStub = sinon
        .stub(SurveyService.prototype, 'insertUpdateDeleteSurveyLocation')
        .resolves();

      const surveyService = new SurveyService(dbConnectionObj);

      const surveyId = 2;
      const putSurveyData = new PutSurveyObject(null);

      await surveyService.updateSurvey(surveyId, putSurveyData);

      expect(updateSurveyDetailsDataStub).not.to.have.been.called;
      expect(updateSurveySpeciesDataStub).not.to.have.been.called;
      expect(updateSurveyPermitDataStub).not.to.have.been.called;
      expect(upsertSurveyFundingSourceDataStub).to.have.been.calledOnce;
      expect(updateSurveyProprietorDataStub).not.to.have.been.called;
      expect(upsertSurveyParticipantDataStub).not.to.have.been.called;
      expect(updateSurveyStratumsStub).not.to.have.been.called;
      expect(insertUpdateDeleteSurveyLocationStub).not.to.have.been.called;
    });

    it('updates everything when all data provided', async () => {
      const dbConnectionObj = getMockDBConnection();

      const updateSurveyDetailsDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyDetailsData').resolves();
      const updateSurveyTypesDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyTypesData').resolves();
      const updateSurveyIntendedOutcomesStub = sinon
        .stub(SurveyService.prototype, 'updateSurveyIntendedOutcomes')
        .resolves();
      const updateSurveySpeciesDataStub = sinon.stub(SurveyService.prototype, 'updateSurveySpeciesData').resolves();
      const updateSurveyPermitDataStub = sinon.stub(SurveyService.prototype, 'updateSurveyPermitData').resolves();
      const upsertSurveyFundingSourceDataStub = sinon
        .stub(SurveyService.prototype, 'upsertSurveyFundingSourceData')
        .resolves();
      const updateSurveyProprietorDataStub = sinon
        .stub(SurveyService.prototype, 'updateSurveyProprietorData')
        .resolves();
      const upsertSurveyParticipantDataStub = sinon
        .stub(SurveyService.prototype, 'upsertSurveyParticipantData')
        .resolves();
      const upsertBlocks = sinon.stub(SurveyBlockService.prototype, 'upsertSurveyBlocks').resolves();
      const replaceSurveyStratumsStub = sinon
        .stub(SiteSelectionStrategyService.prototype, 'replaceSurveySiteSelectionStratums')
        .resolves();
      const replaceSiteStrategiesStub = sinon
        .stub(SiteSelectionStrategyService.prototype, 'replaceSurveySiteSelectionStrategies')
        .resolves();
      const insertUpdateDeleteSurveyLocationStub = sinon
        .stub(SurveyService.prototype, 'insertUpdateDeleteSurveyLocation')
        .resolves();

      const surveyService = new SurveyService(dbConnectionObj);

      const surveyId = 2;
      const putSurveyData = new PutSurveyObject({
        survey_details: {},
        species: {},
        permit: {},
        funding_sources: [{}],
        proprietor: {},
        purpose_and_methodology: {},
        locations: [{}],
        participants: [{}],
        site_selection: { stratums: [], strategies: [] },
        blocks: [{}]
      });

      await surveyService.updateSurvey(surveyId, putSurveyData);

      expect(updateSurveyDetailsDataStub).to.have.been.calledOnce;
      expect(updateSurveyTypesDataStub).to.have.been.calledOnce;
      expect(updateSurveySpeciesDataStub).to.have.been.calledOnce;
      expect(updateSurveyPermitDataStub).to.have.been.calledOnce;
      expect(upsertSurveyFundingSourceDataStub).to.have.been.calledOnce;
      expect(updateSurveyProprietorDataStub).to.have.been.calledOnce;
      expect(upsertSurveyParticipantDataStub).to.have.been.calledOnce;
      expect(upsertBlocks).to.have.been.calledOnce;
      expect(replaceSurveyStratumsStub).to.have.been.calledOnce;
      expect(replaceSiteStrategiesStub).to.have.been.calledOnce;
      expect(insertUpdateDeleteSurveyLocationStub).to.have.been.calledOnce;
      expect(updateSurveyIntendedOutcomesStub).to.have.been.calledOnce;
    });
  });

  describe('getSurveyProprietorDataForSecurityRequest', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = { id: 1 } as unknown as ISurveyProprietorModel;

      const repoStub = sinon
        .stub(SurveyRepository.prototype, 'getSurveyProprietorDataForSecurityRequest')
        .resolves(data);

      const response = await service.getSurveyProprietorDataForSecurityRequest(1);

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

  describe('getSurveyFundingSourceData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches and returns an array of funding sources', async () => {
      const fundingSources = [
        {
          survey_funding_source_id: 5,
          survey_id: 1,
          funding_source_id: 2,
          amount: 1000,
          revision_count: 0,
          funding_source_name: 'FundingSource1',
          start_date: '2023-01-02',
          end_date: null,
          description: 'Funding Source 1'
        }
      ];

      const getSurveyFundingSourcesStub = sinon
        .stub(FundingSourceRepository.prototype, 'getSurveyFundingSources')
        .resolves(fundingSources);

      const surveyService = new SurveyService(getMockDBConnection());

      const response = await surveyService.getSurveyFundingSourceData(1);

      expect(getSurveyFundingSourcesStub).to.be.calledOnce;

      expect(response).to.eql(fundingSources);
    });
  });

  describe('getSurveySupplementaryDataById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches and returns all supplementary data', async () => {
      const getSurveyMetadataPublishRecordStub = sinon
        .stub(HistoryPublishService.prototype, 'getSurveyMetadataPublishRecord')
        .resolves({ survey_metadata_publish_id: 5 } as unknown as any);

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

      const mockSurveyData = { survey_id: 1 } as unknown as SurveyRecord;
      const mockSurveyTypesData = [
        { survey_id: 1, type_id: 2 },
        { survey_id: 1, type_id: 3 }
      ] as unknown as SurveyTypeRecord[];

      const getSurveyDataStub = sinon.stub(SurveyRepository.prototype, 'getSurveyData').resolves(mockSurveyData);
      const getSurveyTypesDataStub = sinon
        .stub(SurveyRepository.prototype, 'getSurveyTypesData')
        .resolves(mockSurveyTypesData);

      const response = await service.getSurveyData(1);

      const expectedResponse = new GetSurveyData({ ...mockSurveyData, survey_types: [2, 3] });

      expect(getSurveyDataStub).to.be.calledOnce;
      expect(getSurveyTypesDataStub).to.be.calledOnce;
      expect(response).to.eql(expectedResponse);
    });
  });

  describe('getSpeciesData', () => {
    it('returns combined species and taxonomy data on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const mockEcologicalUnits = [
        { critterbase_collection_category_id: 'abc', critterbase_collection_unit_id: 'xyz' }
      ];
      const mockSpeciesData = [
        { itis_tsn: 123, ecological_units: [] },
        {
          itis_tsn: 456,
          ecological_units: mockEcologicalUnits
        }
      ] as unknown as TaxonomyWithEcologicalUnits[];
      const mockTaxonomyData = [
        { tsn: '123', scientificName: 'Species 1' },
        { tsn: '456', scientificName: 'Species 2' }
      ];
      const mockResponse = new GetFocalSpeciesData([
        { tsn: 123, scientificName: 'Species 1', ecological_units: [] },
        {
          tsn: 456,
          scientificName: 'Species 2',
          ecological_units: mockEcologicalUnits
        }
      ]);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'getSpeciesData').resolves(mockSpeciesData);
      const getTaxonomyByTsnsStub = sinon
        .stub(PlatformService.prototype, 'getTaxonomyByTsns')
        .resolves(mockTaxonomyData);

      const response = await service.getSpeciesData(1);

      // Assertions
      expect(repoStub).to.be.calledOnce;
      expect(getTaxonomyByTsnsStub).to.be.calledOnceWith([123, 456]);
      expect(response.focal_species).to.eql(mockResponse.focal_species);
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

      const data = [{ survey_location_id: 1 }] as any as SurveyLocationRecord[];

      const repoStub = sinon.stub(SurveyLocationRepository.prototype, 'getSurveyLocationsData').resolves(data);

      const response = await service.getSurveyLocationsData(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getSurveysByIds', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = { id: 1 } as unknown as SurveyObject;

      const repoStub = sinon.stub(SurveyService.prototype, 'getSurveyById').resolves(data);

      const response = await service.getSurveysByIds([1]);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([data]);
    });
  });

  describe('getSurveysByProjectId', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = { id: 1 };

      const repoStub = sinon.stub(SurveyService.prototype, 'getSurveyIdsByProjectId').resolves([data]);
      const surveyStub = sinon
        .stub(SurveyService.prototype, 'getSurveysByIds')
        .resolves([data as unknown as SurveyObject]);
      const response = await service.getSurveysByProjectId(1);

      expect(repoStub).to.be.calledOnce;
      expect(surveyStub).to.be.calledOnce;
      expect(response).to.eql([data]);
    });
  });

  describe('getAttachmentsData', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = { id: 1 } as unknown as GetAttachmentsData;

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

      const data = { id: 1 } as unknown as GetReportAttachmentsData;

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

      const response = await service.insertSurveyData(1, { id: 1 } as unknown as PostSurveyObject);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('insertSurveyTypes', () => {
    it('inserts a survey type and returns nothing', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const typeIds = [2, 3];
      const surveyId = 1;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'insertSurveyTypes').resolves();

      const response = await service.insertSurveyTypes(typeIds, surveyId);

      expect(repoStub).to.be.calledOnceWith(typeIds, surveyId);
      expect(response).to.be.undefined;
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

  describe('insertFocalSpeciesWithUnits', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const mockFocalSpeciesId = 1;
      const mockFocalSpeciesData = {
        tsn: mockFocalSpeciesId,
        scientificName: 'name',
        commonNames: [],
        rank: 'species',
        kingdom: 'Animalia',
        ecological_units: [{ critterbase_collection_category_id: 'abc', critterbase_collection_unit_id: 'xyz' }]
      };
      const insertFocalSpeciesStub = sinon
        .stub(SurveyRepository.prototype, 'insertFocalSpecies')
        .resolves(mockFocalSpeciesId);
      const insertFocalSpeciesUnitsStub = sinon
        .stub(SurveyRepository.prototype, 'insertFocalSpeciesUnits')
        .resolves(mockFocalSpeciesId);

      const response = await service.insertFocalSpeciesWithUnits(mockFocalSpeciesData, 1);

      expect(insertFocalSpeciesStub).to.be.calledOnce;
      expect(insertFocalSpeciesUnitsStub).to.be.calledOnce;
      expect(response).to.eql(mockFocalSpeciesId);
    });
  });

  describe('insertSurveyProprietor', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const data = 1;

      const repoStub = sinon.stub(SurveyRepository.prototype, 'insertSurveyProprietor').resolves(data);

      const response = await service.insertSurveyProprietor({ id: 1 } as unknown as PostProprietorData, 1);

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

  describe('updateSurveyDetailsData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws api error if response is null', async () => {
      const mockDBConnection = getMockDBConnection({ knex: async () => undefined as unknown as any });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.updateSurveyDetailsData(1, { survey_details: 'details' } as unknown as PutSurveyObject);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to update survey data');
      }
    });

    it('returns data if response is not null', async () => {
      const mockQueryResponse = { response: 'something', rowCount: 1 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ knex: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveyDetailsData(1, {
        survey_details: 'details'
      } as unknown as PutSurveyObject);

      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyTypesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('updates survey types and returns nothing', async () => {
      const deleteSurveyTypesDataStub = sinon.stub(SurveyRepository.prototype, 'deleteSurveyTypesData').resolves();
      const insertSurveyTypeStub = sinon.stub(SurveyRepository.prototype, 'insertSurveyTypes').resolves();

      const mockDBConnection = getMockDBConnection();
      const surveyService = new SurveyService(mockDBConnection);

      const surveyId = 1;
      const putSurveyObject: PutSurveyObject = new PutSurveyObject({ survey_details: { survey_types: [22, 33, 44] } });

      await surveyService.updateSurveyTypesData(surveyId, putSurveyObject);

      expect(deleteSurveyTypesDataStub).to.have.been.calledOnceWith(surveyId);
      expect(insertSurveyTypeStub).to.have.been.calledOnceWith([22, 33, 44]);
    });
  });

  describe('updateSurveySpeciesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if response is not null', async () => {
      sinon.stub(SurveyService.prototype, 'deleteSurveySpeciesUnitData').resolves();
      sinon.stub(SurveyService.prototype, 'deleteSurveySpeciesData').resolves();
      sinon.stub(SurveyService.prototype, 'insertFocalSpeciesWithUnits').resolves(1);

      const mockQueryResponse = { response: 'something', rowCount: 1 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ knex: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveySpeciesData(1, {
        survey_details: 'details',
        species: { focal_species: [1] }
      } as unknown as PutSurveyObject);

      expect(response).to.eql([1]);
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

  describe('updateSurveyProprietorData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns undefined', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyService.prototype, 'deleteSurveyProprietorData').resolves();

      const response = await service.updateSurveyProprietorData(1, {
        proprietor: { survey_data_proprietary: false }
      } as unknown as PutSurveyObject);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });

    it('returns and calls insert', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyService.prototype, 'deleteSurveyProprietorData').resolves();
      const serviceStub = sinon.stub(SurveyService.prototype, 'insertSurveyProprietor').resolves();

      const response = await service.updateSurveyProprietorData(1, {
        proprietor: { survey_data_proprietary: 'string' }
      } as unknown as PutSurveyObject);

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

  describe('deleteSurvey', () => {
    it('should delete the survey and return nothing', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const repoStub = sinon.stub(SurveyRepository.prototype, 'deleteSurvey').resolves();

      const surveyId = 1;

      const response = await service.deleteSurvey(surveyId);

      expect(repoStub).to.be.calledOnceWith(surveyId);
      expect(response).to.be.undefined;
    });
  });

  describe('insertUpdateDeleteSurveyLocation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('passes correct data to insert, update, and delete methods', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);

      const geoJson1: Feature[] = [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [1, 2]
          },
          properties: {}
        }
      ];

      const geoJson2: Feature[] = [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [3, 4]
          },
          properties: {}
        }
      ];

      const existingLocationsMock = [
        {
          survey_location_id: 30,
          name: 'Location 1',
          description: 'Location 1 description',
          geometry: {},
          geography: '',
          geojson: geoJson1,
          revision_count: 0
        },
        {
          survey_location_id: 40,
          name: 'Location 2',
          description: 'Location 2 description',
          geometry: {},
          geography: '',
          geojson: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [7, 8]
              },
              properties: {}
            }
          ],
          revision_count: 0
        }
      ] as SurveyLocationRecord[];

      const getSurveyLocationsDataStub = sinon.stub(service, 'getSurveyLocationsData').resolves(existingLocationsMock);
      const insertSurveyLocationsStub = sinon.stub(service, 'insertSurveyLocations').resolves();
      const updateSurveyLocationStub = sinon.stub(service, 'updateSurveyLocation').resolves();
      const deleteSurveyLocationStub = sinon.stub(service, 'deleteSurveyLocation').resolves(existingLocationsMock[1]);
      const insertRegionsStub = sinon.stub(RegionService.prototype, 'insertRegionsIntoSurveyFromFeatures').resolves();

      const surveyId = 20;
      const data: PostSurveyLocationData[] = [
        {
          survey_location_id: 30,
          name: 'Updated Location 1',
          description: 'Existing description',
          geojson: geoJson1,
          revision_count: 0
        },
        {
          survey_location_id: undefined,
          name: 'New Location',
          description: 'New description',
          geojson: geoJson2,
          revision_count: undefined
        }
      ];

      await service.insertUpdateDeleteSurveyLocation(surveyId, data);

      expect(getSurveyLocationsDataStub).to.be.calledOnceWith(surveyId);
      expect(insertSurveyLocationsStub).to.be.calledOnceWith(surveyId, {
        survey_location_id: undefined,
        name: 'New Location',
        description: 'New description',
        geojson: geoJson2,
        revision_count: undefined
      });
      expect(updateSurveyLocationStub).to.be.calledOnceWith({
        survey_location_id: 30,
        name: 'Updated Location 1',
        description: 'Existing description',
        geojson: geoJson1,
        revision_count: 0
      });
      expect(deleteSurveyLocationStub).to.be.calledOnceWith(40);
      expect(insertRegionsStub).to.be.calledWith(surveyId, flatten([geoJson1, geoJson2]));
    });
  });

  describe('deleteSurveyLocation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('calls the deleteSurveyLocation method of SurveyLocationService with correct arguments', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);
      const surveyLocationServiceStub = sinon
        .stub(SurveyLocationService.prototype, 'deleteSurveyLocation')
        .resolves({ survey_location_id: 30, name: 'Location 1' } as SurveyLocationRecord);

      const response = await service.deleteSurveyLocation(30);

      expect(surveyLocationServiceStub).to.be.calledOnceWith(30);
      expect(response).to.eql({ survey_location_id: 30, name: 'Location 1' });
    });
  });

  describe('updateSurveyLocation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('calls the updateSurveyLocation method of SurveyLocationService with correct arguments', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);
      const surveyLocationServiceStub = sinon.stub(SurveyLocationService.prototype, 'updateSurveyLocation').resolves();

      const input = { survey_location_id: 30, name: 'Updated Location 1' } as PostSurveyLocationData;

      await service.updateSurveyLocation(input);

      expect(surveyLocationServiceStub).to.be.calledOnceWith(input);
    });
  });

  describe('insertSurveyIntendedOutcomes', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('calls the updateSurveyLocation method of SurveyLocationService with correct arguments', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);
      const insertionStub = sinon.stub(SurveyRepository.prototype, 'insertManySurveyIntendedOutcomes').resolves();

      await service.insertSurveyIntendedOutcomes([1, 2], 1);

      expect(insertionStub).to.be.calledOnceWith(1, [1, 2]);
    });
  });

  describe('updateSurveyIntendedOutcomes', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('calls the updateSurveyLocation method of SurveyLocationService with correct arguments', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyService(dbConnection);
      const insertionStub = sinon.stub(SurveyRepository.prototype, 'insertManySurveyIntendedOutcomes').resolves();
      const deleteStub = sinon.stub(SurveyRepository.prototype, 'deleteManySurveyIntendedOutcomes').resolves();
      sinon
        .stub(SurveyRepository.prototype, 'getSurveyPurposeAndMethodology')
        .resolves(new GetSurveyPurposeAndMethodologyData({ intended_outcome_ids: [1, 3] }));
      const putObj = new PutSurveyObject({ purpose_and_methodology: { intended_outcome_ids: [1, 2] } });
      await service.updateSurveyIntendedOutcomes(1, putObj);

      expect(insertionStub).to.be.calledOnceWith(1, [2]);
      expect(deleteStub).to.be.calledOnceWith(1, [3]);
    });
  });
});
