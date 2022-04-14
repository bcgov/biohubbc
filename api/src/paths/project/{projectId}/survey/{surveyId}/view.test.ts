import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { COMPLETION_STATUS } from '../../../../../constants/status';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import survey_queries from '../../../../../queries/survey';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as view from './view';

chai.use(sinonChai);

describe('getSurveyForView', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      surveyId: 2
    }
  } as any;

  let actualResult = {
    survey_details: {
      id: null
    },
    survey_purpose_and_methodology: {
      id: null
    },
    survey_proprietor: {
      id: null
    }
  };

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw a 400 error when no get survey basic data sql statement produced', async () => {
    const mockQuery = sinon.fake.resolves({ rowCount: 1, rows: [] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyBasicDataForViewSQL').returns(null);
    sinon.stub(survey_queries, 'getSurveyPurposeAndMethodologyForUpdateSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyFundingSourcesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveySpeciesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`valid sql`);

    try {
      const requestHandler = view.getSurveyForView();
      await requestHandler(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when no survey basic data returned', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onCall(0)
      .resolves({
        rows: [] // empty response
      })
      .onCall(1)
      .resolves({
        rows: [{}]
      })
      .onCall(2)
      .resolves({
        rows: [{}]
      })
      .onCall(3)
      .resolves({
        rows: [{}]
      })
      .onCall(4)
      .resolves({
        rows: [{}]
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyBasicDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyPurposeAndMethodologyForUpdateSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyFundingSourcesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveySpeciesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`valid sql`);

    try {
      const requestHandler = view.getSurveyForView();
      await requestHandler(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get survey basic data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when no get survey funding sql statement produced', async () => {
    const mockQuery = sinon.fake.resolves({ rowCount: 1, rows: [] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyBasicDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyPurposeAndMethodologyForUpdateSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyFundingSourcesDataForViewSQL').returns(null);
    sinon.stub(survey_queries, 'getSurveySpeciesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`valid sql`);

    try {
      const requestHandler = view.getSurveyForView();
      await requestHandler(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when no get survey species sql statement produced', async () => {
    const mockQuery = sinon.fake.resolves({ rowCount: 1, rows: [] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyBasicDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyPurposeAndMethodologyForUpdateSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyFundingSourcesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveySpeciesDataForViewSQL').returns(null);
    sinon.stub(survey_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`valid sql`);

    try {
      const requestHandler = view.getSurveyForView();
      await requestHandler(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when no survey species data returned', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onCall(0)
      .resolves({
        rows: [{}]
      })
      .onCall(1)
      .resolves({
        rows: [{}]
      })
      .onCall(2)
      .resolves({
        rows: [{}]
      })
      .onCall(3)
      .resolves({
        rows: [] // empty response
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyBasicDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyPurposeAndMethodologyForUpdateSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyFundingSourcesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveySpeciesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`valid sql`);

    try {
      const requestHandler = view.getSurveyForView();
      await requestHandler(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get survey species data');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when no get survey proprietor sql statement produced', async () => {
    const mockQuery = sinon.fake.resolves({ rowCount: 1, rows: [] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyBasicDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyPurposeAndMethodologyForUpdateSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyFundingSourcesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveySpeciesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyProprietorForUpdateSQL').returns(null);

    try {
      const requestHandler = view.getSurveyForView();
      await requestHandler(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });

  it('should return the survey and survey proprietor row on success', async () => {
    const survey_basic_data = {
      id: 2,
      name: 'name',
      start_date: '2020/04/04',
      end_date: '2020/05/05',
      lead_first_name: 'first',
      lead_last_name: 'last',
      location_name: 'location',
      geometry: [],
      survey_basic_data: [],
      revision_count: 1,
      publish_timestamp: null,
      number: '123',
      type: 'scientific',
      occurrence_submission_id: 3
    };
    const survey_purpose_and_methodology = {
      id: 17,
      field_method_id: 1,
      additional_details: 'details',
      ecological_season_id: 1,
      intended_outcome_id: 8,
      revision_count: 0,
      vantage_id: 2
    };

    const survey_funding_source_data = {
      pfs_id: 1,
      funding_amount: 100,
      funding_start_date: '2020/04/04',
      funding_end_date: '2020/05/05',
      agency_name: 'agency'
    };

    const survey_species_data = {
      focal_species: ['species'],
      ancillary_species: ['ancillary']
    };

    const survey_proprietor_data = {
      id: 20,
      proprietor_type_id: 12,
      proprietor_type_name: 'type',
      first_nations_name: 'fn name',
      first_nations_id: 1,
      category_rationale: 'rationale',
      proprietor_name: 'name',
      disa_required: true,
      survey_data_proprietary: true,
      revision_count: 3
    };

    const mockQuery = sinon.stub();

    mockQuery
      .onCall(0)
      .resolves({
        rows: [survey_basic_data]
      })
      .onCall(1)
      .resolves({
        rows: [survey_purpose_and_methodology]
      })
      .onCall(2)
      .resolves({
        rows: [survey_funding_source_data]
      })
      .onCall(3)
      .resolves({
        rows: [survey_species_data]
      })
      .onCall(4)
      .resolves({
        rows: [survey_proprietor_data]
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyBasicDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyFundingSourcesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveySpeciesDataForViewSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyPurposeAndMethodologyForUpdateSQL').returns(SQL`valid sql`);
    sinon.stub(survey_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`valid sql`);

    const result = view.getSurveyForView();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult.survey_details.id).to.equal(2);
    expect(actualResult.survey_details).to.eql({
      id: survey_basic_data.id,
      occurrence_submission_id: survey_basic_data.occurrence_submission_id,
      survey_name: survey_basic_data.name,
      focal_species: survey_species_data.focal_species,
      ancillary_species: survey_species_data.ancillary_species,
      start_date: survey_basic_data.start_date,
      end_date: survey_basic_data.end_date,
      biologist_first_name: survey_basic_data.lead_first_name,
      biologist_last_name: survey_basic_data.lead_last_name,
      survey_area_name: survey_basic_data.location_name,
      revision_count: survey_basic_data.revision_count,
      geometry: survey_basic_data.geometry,
      permit_number: survey_basic_data.number,
      permit_type: survey_basic_data.type,
      completion_status: COMPLETION_STATUS.COMPLETED,
      publish_date: '',
      funding_sources: [
        {
          pfs_id: survey_funding_source_data.pfs_id,
          agency_name: survey_funding_source_data.agency_name,
          funding_start_date: survey_funding_source_data.funding_start_date,
          funding_end_date: survey_funding_source_data.funding_end_date,
          funding_amount: survey_funding_source_data.funding_amount
        }
      ]
    });
    expect(actualResult.survey_proprietor).to.eql({
      id: survey_proprietor_data.id,
      proprietary_data_category: survey_proprietor_data.proprietor_type_id,
      proprietary_data_category_name: survey_proprietor_data.proprietor_type_name,
      first_nations_name: survey_proprietor_data.first_nations_name,
      first_nations_id: survey_proprietor_data.first_nations_id,
      category_rationale: survey_proprietor_data.category_rationale,
      proprietor_name: survey_proprietor_data.proprietor_name,
      survey_data_proprietary: survey_proprietor_data.survey_data_proprietary,
      data_sharing_agreement_required: 'true',
      revision_count: survey_proprietor_data.revision_count
    });

    expect(actualResult.survey_purpose_and_methodology).to.eql({
      id: survey_purpose_and_methodology.id,
      additional_details: survey_purpose_and_methodology.additional_details,
      ecological_season_id: survey_purpose_and_methodology.ecological_season_id,
      field_method_id: survey_purpose_and_methodology.field_method_id,
      intended_outcome_id: survey_purpose_and_methodology.intended_outcome_id,
      revision_count: survey_purpose_and_methodology.revision_count,
      vantage_code_ids: [survey_purpose_and_methodology.vantage_id]
    });
  });
});
