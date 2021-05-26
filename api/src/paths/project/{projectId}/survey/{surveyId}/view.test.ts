import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as view from './view';
import * as db from '../../../../../database/db';
import * as survey_view_queries from '../../../../../queries/survey/survey-view-queries';
import * as survey_view_update_queries from '../../../../../queries/survey/survey-view-update-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('getSurveyForView', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = {
    systemUserId: () => {
      return null;
    },
    open: async () => {
      // do nothing
    },
    release: () => {
      // do nothing
    },
    commit: async () => {
      // do nothing
    },
    rollback: async () => {
      // do nothing
    },
    query: async () => {
      // do nothing
    }
  };

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

  it('should throw a 400 error when no get survey sql statement produced', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    sinon.stub(survey_view_queries, 'getSurveyForViewSQL').returns(null);

    try {
      const result = view.getSurveyForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return the survey and survey proprietor row on success', async () => {
    const survey_proprietor = {
      id: 20,
      proprietor_type_id: 12,
      proprietor_type_name: 'type',
      first_nations_name: 'fn name',
      category_rationale: 'rationale',
      proprietor_name: 'name',
      disa_required: true,
      first_nations_id: 1,
      isProprietary: 'true',
      revision_count: 3
    };

    const survey_details = {
      id: 2,
      name: 'name',
      objectives: 'objective',
      focal_species: 'species',
      ancillary_species: 'ancillary',
      start_date: '2020/04/04',
      end_date: '2020/05/05',
      lead_first_name: 'first',
      lead_last_name: 'last',
      location_name: 'location',
      revision_count: 1,
      geometry: []
    };

    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rows: [survey_details]
      })
      .onSecondCall()
      .resolves({
        rows: [survey_proprietor]
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_view_update_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`some query`);
    sinon.stub(survey_view_queries, 'getSurveyForViewSQL').returns(SQL`some query`);

    const result = view.getSurveyForView();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult.survey_details.id).to.equal(2);
    expect(actualResult.survey_details).to.eql({
      id: survey_details.id,
      survey_name: survey_details.name,
      survey_purpose: survey_details.objectives,
      focal_species: [survey_details.focal_species],
      ancillary_species: [survey_details.ancillary_species],
      start_date: survey_details.start_date,
      end_date: survey_details.end_date,
      biologist_first_name: survey_details.lead_first_name,
      biologist_last_name: survey_details.lead_last_name,
      survey_area_name: survey_details.location_name,
      revision_count: survey_details.revision_count,
      geometry: survey_details.geometry
    });
    expect(actualResult.survey_proprietor).to.eql({
      isProprietary: survey_proprietor.isProprietary,
      id: survey_proprietor.id,
      proprietary_data_category: survey_proprietor.proprietor_type_id,
      proprietary_data_category_name: survey_proprietor.proprietor_type_name,
      first_nations_name: survey_proprietor.first_nations_name,
      first_nations_id: survey_proprietor.first_nations_id,
      category_rationale: survey_proprietor.category_rationale,
      proprietor_name: survey_proprietor.proprietor_name,
      data_sharing_agreement_required: 'true',
      revision_count: survey_proprietor.revision_count
    });
  });

  it('should return null when response has no rows (no survey/survey proprietor found)', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rows: null
      })
      .onSecondCall()
      .resolves({
        rows: null
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_view_update_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`some query`);
    sinon.stub(survey_view_queries, 'getSurveyForViewSQL').returns(SQL`some query`);

    const result = view.getSurveyForView();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult.survey_details).to.be.null;
    expect(actualResult.survey_proprietor).to.be.null;
  });
});
