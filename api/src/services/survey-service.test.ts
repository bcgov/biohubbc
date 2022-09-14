import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiGeneralError } from '../errors/custom-error';
import { GetReportAttachmentsData } from '../models/project-view';
import { PostProprietorData, PostSurveyObject } from '../models/survey-create';
import { PutSurveyObject } from '../models/survey-update';
import {
  GetAncillarySpeciesData,
  GetAttachmentsData,
  GetFocalSpeciesData,
  GetPermitData,
  GetSurveyData,
  GetSurveyFundingSources,
  GetSurveyLocationData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData
} from '../models/survey-view';
import { getMockDBConnection } from '../__mocks__/db';
import { SurveyService } from './survey-service';
import { TaxonomyService } from './taxonomy-service';

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

  describe('getSurveyIdsByProjectId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets survey ids by project id', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });

      const projectId = 1;

      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getSurveyIdsByProjectId(projectId);

      expect(response).to.eql([{ id: 123 }]);
    });
  });

  describe('getSurveyById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets survey data by id', async () => {
      const getSurveyDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyData')
        .resolves(({ id: 1 } as unknown) as GetSurveyData);

      const getSpeciesDataStub = sinon
        .stub(SurveyService.prototype, 'getSpeciesData')
        .resolves(({ focal_species: [1] } as unknown) as GetFocalSpeciesData & GetAncillarySpeciesData);

      const getPermitDataStub = sinon
        .stub(SurveyService.prototype, 'getPermitData')
        .resolves(({ permit_number: 1 } as unknown) as GetPermitData);

      const getSurveyFundingSourcesDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyFundingSourcesData')
        .resolves(({ funding_sources: [1] } as unknown) as GetSurveyFundingSources);

      const getSurveyPurposeAndMethodologyStub = sinon
        .stub(SurveyService.prototype, 'getSurveyPurposeAndMethodology')
        .resolves(({ GetSurveyPurposeAndMethodologyData: 1 } as unknown) as GetSurveyPurposeAndMethodologyData);

      const getSurveyProprietorDataForViewStub = sinon
        .stub(SurveyService.prototype, 'getSurveyProprietorDataForView')
        .resolves(({ proprietor_type_id: 1 } as unknown) as GetSurveyProprietorData);

      const getSurveyLocationDataStub = sinon
        .stub(SurveyService.prototype, 'getSurveyLocationData')
        .resolves(({ survey_area_name: 'name' } as unknown) as GetSurveyLocationData);

      const surveyService = new SurveyService(getMockDBConnection());
      const response = await surveyService.getSurveyById(1);

      expect(response).to.eql({
        survey_details: { id: 1 },
        species: { focal_species: [1] },
        permit: { permit_number: 1 },
        purpose_and_methodology: { GetSurveyPurposeAndMethodologyData: 1 },
        funding: { funding_sources: [1] },
        proprietor: { proprietor_type_id: 1 },
        location: { survey_area_name: 'name' }
      });

      expect(getSurveyDataStub).to.be.calledOnce;
      expect(getSpeciesDataStub).to.be.calledOnce;
      expect(getPermitDataStub).to.be.calledOnce;
      expect(getSurveyFundingSourcesDataStub).to.be.calledOnce;
      expect(getSurveyPurposeAndMethodologyStub).to.be.calledOnce;
      expect(getSurveyProprietorDataForViewStub).to.be.calledOnce;
      expect(getSurveyLocationDataStub).to.be.calledOnce;
    });
  });

  describe('getSurveySupplementaryDataById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets data if no errors', async () => {
      const getOccurrenceSubmissionIdStub = sinon
        .stub(SurveyService.prototype, 'getOccurrenceSubmissionId')
        .resolves(({ occurrence_submission: 1 } as unknown) as any);

      const getSummaryResultIdStub = sinon
        .stub(SurveyService.prototype, 'getSummaryResultId')
        .resolves(({ survey_summary_submission: 1 } as unknown) as any);

      const surveyService = new SurveyService(getMockDBConnection());

      const response = await surveyService.getSurveySupplementaryDataById(1);

      expect(response).to.eql({
        occurrence_submission: { occurrence_submission: 1 },
        summary_result: { survey_summary_submission: 1 }
      });
      expect(getOccurrenceSubmissionIdStub).to.be.calledOnce;
      expect(getSummaryResultIdStub).to.be.calledOnce;
    });
  });

  describe('getSurveyData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws api error if response is null', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.getSurveyData(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to get project survey details data');
      }
    });

    it('Gets all survey data if response is not null', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getSurveyData(1);

      expect(response).to.eql(new GetSurveyData(mockRowObj));
    });
  });

  describe('getSpeciesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws api error if response is null', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.getSpeciesData(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to get survey species data');
      }
    });

    it('returns data if response is not null', async () => {
      const getSpeciesFromIds = sinon
        .stub(TaxonomyService.prototype, 'getSpeciesFromIds')
        .resolves(([{ id: 123 }] as unknown) as any);

      const mockRowObj = [
        { is_focal: true, wldtaxonomic_units_id: 123 },
        { is_focal: false, wldtaxonomic_units_id: 321 }
      ];
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getSpeciesData(1);

      expect(response).to.eql({
        ...new GetFocalSpeciesData([{ id: 123 }]),
        ...new GetAncillarySpeciesData([{ id: 123 }])
      });
      expect(getSpeciesFromIds).to.be.calledTwice;
    });
  });

  describe('getPermitData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getPermitData(1);

      expect(response).to.eql(new GetPermitData({ id: 1 }));
    });
  });

  describe('getSurveyPurposeAndMethodology', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getSurveyPurposeAndMethodology(1);

      expect(response).to.eql(new GetSurveyPurposeAndMethodologyData({ id: 1 }));
    });

    it('throws error if response is invalid', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.getSurveyPurposeAndMethodology(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to get survey purpose and methodology data');
      }
    });
  });

  describe('getSurveyFundingSourcesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getSurveyFundingSourcesData(1);

      expect(response).to.eql(new GetSurveyFundingSources([{ id: 1 }]));
    });

    it('throws error if response is invalid', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.getSurveyFundingSourcesData(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to get survey funding sources data');
      }
    });
  });

  describe('getSurveyProprietorDataForView', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getSurveyProprietorDataForView(1);

      expect(response).to.eql(new GetSurveyProprietorData([{ id: 1 }]));
    });

    it('throws error if response is invalid', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.getSurveyProprietorDataForView(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to get survey proprietor data');
      }
    });
  });

  describe('getSurveyLocationData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getSurveyLocationData(1);

      expect(response).to.eql(new GetSurveyLocationData({ id: 1 }));
    });

    it('throws error if response is invalid', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.getSurveyLocationData(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to get project survey details data');
      }
    });
  });

  describe('getOccurrenceSubmissionId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getOccurrenceSubmissionId(1);

      expect(response).to.eql({ id: 1 });
    });

    it('returns null if response is empty', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getOccurrenceSubmissionId(1);

      expect(response).to.eql(null);
    });
  });

  describe('getLatestSurveyOccurrenceSubmission', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getLatestSurveyOccurrenceSubmission(1);

      expect(response).to.eql({ id: 1 });
    });

    it('returns null if response is empty', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getLatestSurveyOccurrenceSubmission(1);

      expect(response).to.eql(null);
    });
  });

  describe('getSummaryResultId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getSummaryResultId(1);

      expect(response).to.eql({ id: 1 });
    });

    it('returns null if response is empty', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getSummaryResultId(1);

      expect(response).to.eql(null);
    });
  });

  describe('getAttachmentsData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getAttachmentsData(1);

      expect(response).to.eql(new GetAttachmentsData([{ id: 1 }]));
    });
  });

  describe('getReportAttachmentsData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.getReportAttachmentsData(1);

      expect(response).to.eql(new GetReportAttachmentsData([{ id: 1 }]));
    });
  });

  describe('insertSurveyData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.insertSurveyData(1, ({
        survey_details: {
          survey_name: 'name',
          start_date: 'date',
          end_date: 'date',
          biologist_first_name: 'name',
          biologist_last_name: 'name'
        },
        purpose_and_methodology: {
          field_method_id: 'name',
          additional_details: 'date',
          ecological_season_id: 'date',
          intended_outcome_id: 'name',
          surveyed_all_areas: 'name'
        },
        location: { survey_area_name: 'name', geometry: [{ stuff: 'geometry' }] }
      } as unknown) as PostSurveyObject);

      expect(response).to.eql(1);
    });

    it('throws error if response is invalid', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.insertSurveyData(1, ({
          survey_details: {
            survey_name: 'name',
            start_date: 'date',
            end_date: 'date',
            biologist_first_name: 'name',
            biologist_last_name: 'name'
          },
          purpose_and_methodology: {
            field_method_id: 'name',
            additional_details: 'date',
            ecological_season_id: 'date',
            intended_outcome_id: 'name',
            surveyed_all_areas: 'name'
          },
          location: { survey_area_name: 'name', geometry: [{ stuff: 'geometry' }] }
        } as unknown) as PostSurveyObject);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to insert survey data');
      }
    });
  });

  describe('insertFocalSpecies', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.insertFocalSpecies(1, 1);

      expect(response).to.eql(1);
    });

    it('throws error if response is invalid', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.insertFocalSpecies(1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to insert focal species data');
      }
    });
  });

  describe('insertAncillarySpecies', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.insertAncillarySpecies(1, 1);

      expect(response).to.eql(1);
    });

    it('throws error if response is invalid', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.insertAncillarySpecies(1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to insert ancillary species data');
      }
    });
  });

  describe('insertVantageCodes', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if valid return', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.insertVantageCodes(1, 1);

      expect(response).to.eql(1);
    });

    it('throws error if response is invalid', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.insertVantageCodes(1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to insert ancillary species data');
      }
    });
  });

  describe('insertSurveyProprietor', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns in survey_data_proprietary is undefinded', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.insertSurveyProprietor(({ prt_id: 1 } as unknown) as PostProprietorData, 1);

      expect(response).to.eql(undefined);
    });

    it('throws error if response is invalid', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.insertSurveyProprietor(
          ({ survey_data_proprietary: 'data', prt_id: 1 } as unknown) as PostProprietorData,
          1
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to insert survey proprietor data');
      }
    });

    it('returns data if response is not null', async () => {
      const mockQueryResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.insertSurveyProprietor(
        ({ survey_data_proprietary: 'data', prt_id: 1 } as unknown) as PostProprietorData,
        1
      );

      expect(response).to.eql(1);
    });
  });

  describe('insertOrAssociatePermitToSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws api error if response is null', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 0 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.insertOrAssociatePermitToSurvey(1, 1, 1, 'string', 'type');
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to upsert survey permit record');
      }
    });

    it('returns data if response is not null', async () => {
      const mockQueryResponse = ({ rows: [{ data: 1 }], rowCount: 1 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.insertOrAssociatePermitToSurvey(1, 1, 1, 'string', '');

      expect(response).to.eql(undefined);
    });
  });

  describe('insertSurveyFundingSource', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws api error if response is null', async () => {
      const mockDBConnection = getMockDBConnection({ query: async () => (undefined as unknown) as any });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.insertSurveyFundingSource(1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to insert survey funding source data');
      }
    });

    it('returns data if response is not null', async () => {
      const mockQueryResponse = ({ response: 'something' } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.insertSurveyFundingSource(1, 1);

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
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if response is not null', async () => {
      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.deleteSurveySpeciesData(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyPermitData', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('returns undefined if not permit number is given', async () => {
      sinon.stub(SurveyService.prototype, 'unassociatePermitFromSurvey').resolves();
      sinon.stub(SurveyService.prototype, 'insertOrAssociatePermitToSurvey').resolves(undefined);

      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveyPermitData(1, 1, ({
        permit: {}
      } as unknown) as PutSurveyObject);

      expect(response).to.eql(undefined);
    });

    it('returns data if response is not null', async () => {
      sinon.stub(SurveyService.prototype, 'unassociatePermitFromSurvey').resolves();
      sinon.stub(SurveyService.prototype, 'insertOrAssociatePermitToSurvey').resolves(undefined);

      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveyPermitData(1, 1, ({
        permit: { permit_number: '1', permit_type: 'type' }
      } as unknown) as PutSurveyObject);

      expect(response).to.eql(undefined);
    });
  });

  describe('unassociatePermitFromSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if response is not null', async () => {
      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.unassociatePermitFromSurvey(1);

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

    it('returns data if response is not null', async () => {
      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.deleteSurveyFundingSourcesData(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyProprietorData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns undefined if not survey_data_proprietary is given', async () => {
      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveyProprietorData(1, ({
        permit: { permit_number: '1', permit_type: 'type' },
        funding: { funding_sources: [1] },
        proprietor: { survey_data_proprietary: undefined }
      } as unknown) as PutSurveyObject);

      expect(response).to.eql(undefined);
    });

    it('returns data if response is not null', async () => {
      sinon.stub(SurveyService.prototype, 'insertSurveyProprietor').resolves(1);

      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.updateSurveyProprietorData(1, ({
        permit: { permit_number: '1', permit_type: 'type' },
        funding: { funding_sources: [1] },
        proprietor: { survey_data_proprietary: 'asd' }
      } as unknown) as PutSurveyObject);

      expect(response).to.eql(1);
    });
  });

  describe('deleteSurveyProprietorData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns data if response is not null', async () => {
      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.deleteSurveyProprietorData(1);

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
    afterEach(() => {
      sinon.restore();
    });

    it('throws errors if response is empty', async () => {
      const mockQueryResponse = (undefined as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      try {
        await surveyService.deleteSurveyVantageCodes(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Failed to delete survey vantage codes');
      }
    });

    it('returns data if response is not null', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });
      const surveyService = new SurveyService(mockDBConnection);

      const response = await surveyService.deleteSurveyVantageCodes(1);

      expect(response).to.eql(undefined);
    });
  });
});
