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
    id: null,
    survey: null,
    surveyProprietor: null
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

  // it('should throw a 400 error when no get survey proprietor sql statement produced', async () => {
  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     }
  //   });
  //   sinon.stub(survey_view_update_queries, 'getSurveyProprietorSQL').returns(null);

  //   try {
  //     const result = view.getSurveyForView();

  //     await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
  //     expect.fail();
  //   } catch (actualError) {
  //     expect(actualError.status).to.equal(400);
  //     expect(actualError.message).to.equal('Failed to build SQL get statement');
  //   }
  // });

  it('should return the survey and survey proprietor row on success', async () => {
    const surveyProprietor = {
      proprietor_type_name: 'type',
      first_nations_name: 'fn name',
      rationale: 'rationale',
      proprietor_name: 'name',
      data_sharing_agreement_required: true
    };

    const survey = {
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
        rows: [survey]
      })
      .onSecondCall()
      .resolves({
        rows: [surveyProprietor]
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_view_update_queries, 'getSurveyProprietorSQL').returns(SQL`some query`);
    sinon.stub(survey_view_queries, 'getSurveyForViewSQL').returns(SQL`some query`);

    const result = view.getSurveyForView();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult.id).to.equal(2);
    expect(actualResult.survey).to.eql({
      survey_name: survey.name,
      survey_purpose: survey.objectives,
      focal_species: [survey.focal_species],
      ancillary_species: [survey.ancillary_species],
      start_date: survey.start_date,
      end_date: survey.end_date,
      biologist_first_name: survey.lead_first_name,
      biologist_last_name: survey.lead_last_name,
      survey_area_name: survey.location_name,
      revision_count: survey.revision_count,
      geometry: survey.geometry
    });
    expect(actualResult.surveyProprietor).to.eql({
      proprietor_type_name: surveyProprietor.proprietor_type_name,
      first_nations_name: surveyProprietor.first_nations_name,
      category_rationale: surveyProprietor.rationale,
      proprietor_name: surveyProprietor.proprietor_name,
      data_sharing_agreement_required: 'true'
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

    sinon.stub(survey_view_update_queries, 'getSurveyProprietorSQL').returns(SQL`some query`);
    sinon.stub(survey_view_queries, 'getSurveyForViewSQL').returns(SQL`some query`);

    const result = view.getSurveyForView();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult.survey).to.be.null;
    expect(actualResult.surveyProprietor).to.be.null;
    expect(actualResult.id).to.equal(2);
  });
});
