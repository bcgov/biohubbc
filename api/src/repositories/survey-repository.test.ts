import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { GetReportAttachmentsData } from '../models/project-view';
import { PostProprietorData, PostSurveyObject } from '../models/survey-create';
import { PutSurveyObject } from '../models/survey-update';
import {
  GetAttachmentsData,
  GetSurveyData,
  GetSurveyLocationData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData
} from '../models/survey-view';
import { getMockDBConnection } from '../__mocks__/db';
import {
  IObservationSubmissionInsertDetails,
  IObservationSubmissionUpdateDetails,
  SurveyRepository
} from './survey-repository';

chai.use(sinonChai);

describe('SurveyRepository', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('deleteSurvey', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.deleteSurvey(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('getSurveyIdsByProjectId', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getSurveyIdsByProjectId(1);

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.getSurveyIdsByProjectId(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project survey ids');
      }
    });
  });

  describe('getSurveyData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getSurveyData(1);

      expect(response).to.eql(new GetSurveyData({ id: 1 }));
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.getSurveyData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project survey details data');
      }
    });
  });

  describe('getSpeciesData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getSpeciesData(1);

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.getSpeciesData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get survey species data');
      }
    });
  });

  describe('getSurveyPurposeAndMethodology', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getSurveyPurposeAndMethodology(1);

      expect(response).to.eql(new GetSurveyPurposeAndMethodologyData({ id: 1 }));
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.getSurveyPurposeAndMethodology(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get survey purpose and methodology data');
      }
    });
  });

  describe('getSurveyProprietorDataForView', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getSurveyProprietorDataForView(1);

      expect(response).to.eql(new GetSurveyProprietorData({ id: 1 }));
    });

    it('should return Null', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getSurveyProprietorDataForView(1);

      expect(response).to.eql(null);
    });
  });

  describe('getSurveyLocationData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getSurveyLocationData(1);

      expect(response).to.eql(new GetSurveyLocationData({ id: 1 }));
    });
  });

  describe('getOccurrenceSubmissionId', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getOccurrenceSubmission(1);

      expect(response).to.eql({ id: 1 });
    });

    it('should return null if now rows returned', async () => {
      const mockResponse = ({ rows: [{ occurrence_submission_id: null }], rowCount: 1 } as any) as Promise<
        QueryResult<any>
      >;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getOccurrenceSubmission(1);

      expect(response).to.eql({ occurrence_submission_id: null });
    });
  });

  describe('getLatestSurveyOccurrenceSubmission', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getLatestSurveyOccurrenceSubmission(1);

      expect(response).to.eql({ id: 1 });
    });

    it('should return Null', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getLatestSurveyOccurrenceSubmission(1);

      expect(response).to.eql(null);
    });
  });

  describe('getSurveySummarySubmission', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getSurveySummarySubmission(1);

      expect(response).to.eql({ id: 1 });
    });

    it('should return null if now rows returned', async () => {
      const mockResponse = ({ rows: [{ survey_summary_submission_id: null }], rowCount: 1 } as any) as Promise<
        QueryResult<any>
      >;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getSurveySummarySubmission(1);

      expect(response).to.eql({ survey_summary_submission_id: null });
    });
  });

  describe('getAttachmentsData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getAttachmentsData(1);

      expect(response).to.eql(new GetAttachmentsData([{ id: 1 }]));
    });

    it('should return Null', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getAttachmentsData(1);

      expect(response).to.eql(new GetAttachmentsData(undefined));
    });
  });

  describe('getReportAttachmentsData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getReportAttachmentsData(1);

      expect(response).to.eql(new GetReportAttachmentsData([{ id: 1 }]));
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.getReportAttachmentsData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get attachments data');
      }
    });
  });

  describe('insertSurveyData', () => {
    it('should return result and add the geometry', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const input = ({
        survey_details: {
          survey_name: 'name',
          start_date: 'start',
          end_date: 'end',
          biologist_first_name: 'first',
          biologist_last_name: 'last'
        },
        purpose_and_methodology: {
          field_method_id: 1,
          additional_details: '',
          ecological_season_id: 1,
          intended_outcome_id: 1,
          surveyed_all_areas: 'Y'
        },
        location: { geometry: [{ id: 1 }] }
      } as unknown) as PostSurveyObject;

      const response = await repository.insertSurveyData(1, input);

      expect(response).to.eql(1);
    });

    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const input = ({
        survey_details: {
          survey_name: 'name',
          start_date: 'start',
          end_date: 'end',
          biologist_first_name: 'first',
          biologist_last_name: 'last'
        },
        purpose_and_methodology: {
          field_method_id: 1,
          additional_details: '',
          ecological_season_id: 1,
          intended_outcome_id: 1,
          surveyed_all_areas: 'Y'
        },
        location: { geometry: [] }
      } as unknown) as PostSurveyObject;

      const response = await repository.insertSurveyData(1, input);

      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const input = ({
        survey_details: {
          survey_name: 'name',
          start_date: 'start',
          end_date: 'end',
          biologist_first_name: 'first',
          biologist_last_name: 'last'
        },
        purpose_and_methodology: {
          field_method_id: 1,
          additional_details: '',
          ecological_season_id: 1,
          intended_outcome_id: 1,
          surveyed_all_areas: 'Y'
        },
        location: { geometry: [{ id: 1 }] }
      } as unknown) as PostSurveyObject;

      try {
        await repository.insertSurveyData(1, input);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert survey data');
      }
    });
  });

  describe('insertFocalSpecies', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.insertFocalSpecies(1, 1);

      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.insertFocalSpecies(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert focal species data');
      }
    });
  });

  describe('insertAncillarySpecies', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.insertAncillarySpecies(1, 1);

      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.insertAncillarySpecies(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert ancillary species data');
      }
    });
  });

  describe('insertVantageCodes', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.insertVantageCodes(1, 1);

      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.insertVantageCodes(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert vantage codes');
      }
    });
  });

  describe('insertSurveyProprietor', () => {
    it('should return undefined if data is not proprietary', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const input = ({
        survey_data_proprietary: false
      } as unknown) as PostProprietorData;

      const response = await repository.insertSurveyProprietor(input, 1);

      expect(response).to.eql(undefined);
    });

    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const input = ({
        survey_data_proprietary: true,
        prt_id: 1,
        fn_id: 1,
        rationale: 'ratio',
        proprietor_name: 'name',
        disa_required: false
      } as unknown) as PostProprietorData;

      const response = await repository.insertSurveyProprietor(input, 1);

      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const input = ({
        survey_data_proprietary: true,
        prt_id: 1,
        fn_id: 1,
        rationale: 'ratio',
        proprietor_name: 'name',
        disa_required: false
      } as unknown) as PostProprietorData;

      try {
        await repository.insertSurveyProprietor(input, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert survey proprietor data');
      }
    });
  });

  describe('associateSurveyToPermit', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.associateSurveyToPermit(1, 1, '1');

      expect(response).to.eql(undefined);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.associateSurveyToPermit(1, 1, '1');
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to update survey permit record');
      }
    });
  });

  describe('insertSurveyPermit', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.insertSurveyPermit(1, 1, 1, 'number', 'type');

      expect(response).to.eql(undefined);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.insertSurveyPermit(1, 1, 1, 'number', 'type');
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert survey permit record');
      }
    });
  });

  describe('deleteSurveySpeciesData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.deleteSurveySpeciesData(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('unassociatePermitFromSurvey', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.unassociatePermitFromSurvey(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('deleteSurveyProprietorData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.deleteSurveyProprietorData(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('deleteSurveyVantageCodes', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.deleteSurveyVantageCodes(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('updateSurveyDetailsData', () => {
    it('should return undefined and ue all inputs', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const input = ({
        survey_details: {
          name: 'name',
          start_date: 'start',
          end_date: 'end',
          lead_first_name: 'first',
          lead_last_name: 'last',
          revision_count: 1
        },
        purpose_and_methodology: {
          field_method_id: 1,
          additional_details: '',
          ecological_season_id: 1,
          intended_outcome_id: 1,
          surveyed_all_areas: 'Y',
          revision_count: 1
        },
        location: { geometry: [{ id: 1 }] }
      } as unknown) as PutSurveyObject;

      const response = await repository.updateSurveyDetailsData(1, input);

      expect(response).to.eql(undefined);
    });

    it('should return undefined and ue all inputs', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const input = ({
        survey_details: {
          name: 'name',
          start_date: 'start',
          end_date: 'end',
          lead_first_name: 'first',
          lead_last_name: 'last',
          revision_count: 1
        },
        purpose_and_methodology: {
          field_method_id: 1,
          additional_details: '',
          ecological_season_id: 1,
          intended_outcome_id: 1,
          surveyed_all_areas: 'Y',
          revision_count: 1
        },
        location: { geometry: [] }
      } as unknown) as PutSurveyObject;

      const response = await repository.updateSurveyDetailsData(1, input);

      expect(response).to.eql(undefined);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const input = ({
        survey_details: {
          name: 'name',
          start_date: 'start',
          end_date: 'end',
          lead_first_name: 'first',
          lead_last_name: 'last',
          revision_count: 1
        },
        purpose_and_methodology: {
          field_method_id: 1,
          additional_details: '',
          ecological_season_id: 1,
          intended_outcome_id: 1,
          surveyed_all_areas: 'Y',
          revision_count: 1
        },
        location: { geometry: [] }
      } as unknown) as PutSurveyObject;

      try {
        await repository.updateSurveyDetailsData(1, input);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to update survey data');
      }
    });
  });

  describe('getOccurrenceSubmissionMessages', () => {
    it('should return result', async () => {
      const mockResponse = ({
        rows: [
          {
            id: 1,
            type: 'type',
            status: 'status',
            class: 'class',
            message: 'message'
          }
        ],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getOccurrenceSubmissionMessages(1);

      expect(response).to.eql([
        {
          id: 1,
          type: 'type',
          status: 'status',
          class: 'class',
          message: 'message'
        }
      ]);
    });

    it('should return empty array', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.getOccurrenceSubmissionMessages(1);

      expect(response).to.eql([]);
    });
  });

  describe('insertSurveyOccurrenceSubmission', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ submissionId: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.insertSurveyOccurrenceSubmission({
        surveyId: 1
      } as IObservationSubmissionInsertDetails);

      expect(response).to.eql({ submissionId: 1 });
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.insertSurveyOccurrenceSubmission({ surveyId: 1 } as IObservationSubmissionInsertDetails);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert survey occurrence submission');
      }
    });
  });

  describe('updateSurveyOccurrenceSubmission', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ submissionId: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.updateSurveyOccurrenceSubmission({
        submissionId: 1
      } as IObservationSubmissionUpdateDetails);

      expect(response).to.eql({ submissionId: 1 });
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.updateSurveyOccurrenceSubmission({ submissionId: 1 } as IObservationSubmissionUpdateDetails);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to update survey occurrence submission');
      }
    });
  });

  describe('deleteOccurrenceSubmission', () => {
    it('should return 1 upon success', async () => {
      const mockResponse = ({ rows: [{ submissionId: 2 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.deleteOccurrenceSubmission(2);

      expect(response).to.eql(1);
    });

    it('should throw an error upon failure', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await await repository.deleteOccurrenceSubmission(2);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to delete survey occurrence submission');
      }
    });
  });
});
