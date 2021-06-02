import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as update from './update';
import * as db from '../../../../../database/db';
import * as survey_view_update_queries from '../../../../../queries/survey/survey-view-update-queries';
import * as survey_update_queries from '../../../../../queries/survey/survey-update-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('getSurveyForUpdate', () => {
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

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        },
        send: (status: number) => {
          actualResult = status;
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

    sinon.stub(survey_view_update_queries, 'getSurveyDetailsForUpdateSQL').returns(null);

    try {
      const result = update.getSurveyForUpdate();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build survey details SQL get statement');
    }
  });

  it('should return survey details and proprietor info when no entity is specified, on success', async () => {
    const survey_details = {
      id: 1,
      name: 'name',
      objectives: 'objective',
      focal_species: 1,
      ancillary_species: 3,
      start_date: '2020/04/04',
      end_date: '2020/05/05',
      lead_first_name: 'first',
      lead_last_name: 'last',
      location_name: 'location',
      revision_count: 1,
      geometry: []
    };

    const survey_proprietor = {
      category_rationale: '',
      data_sharing_agreement_required: 'false',
      first_nations_id: null,
      first_nations_name: '',
      id: 1,
      proprietary_data_category: null,
      proprietary_data_category_name: '',
      proprietor_name: '',
      survey_data_proprietary: 'true',
      revision_count: 1
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

    sinon.stub(survey_view_update_queries, 'getSurveyDetailsForUpdateSQL').returns(SQL`some query`);
    sinon.stub(survey_view_update_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`some query`);

    const result = update.getSurveyForUpdate();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      survey_details: {
        id: 1,
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
      },

      survey_proprietor: {
        category_rationale: survey_proprietor.category_rationale,
        data_sharing_agreement_required: survey_proprietor.data_sharing_agreement_required,
        first_nations_id: survey_proprietor.first_nations_id,
        first_nations_name: survey_proprietor.first_nations_name,
        id: survey_proprietor.id,
        proprietary_data_category: survey_proprietor.proprietary_data_category,
        proprietary_data_category_name: survey_proprietor.proprietary_data_category_name,
        proprietor_name: survey_proprietor.proprietor_name,
        survey_data_proprietary: survey_proprietor.survey_data_proprietary,
        revision_count: survey_proprietor.revision_count
      }
    });
  });
});

describe('updateSurvey', () => {
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
    },
    body: {
      survey_details: {
        survey_name: 'name',
        survey_purpose: 'purpose',
        species: 'species',
        start_date: '2020/03/03',
        end_date: '2020/04/04',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        revision_count: 1,
        geometry: []
      }
    }
  } as any;

  let actualResult: number = (null as unknown) as number;

  const sampleRes = {
    status: (status: number) => {
      return {
        send: () => {
          actualResult = status;
        }
      };
    }
  };

  it('should throw a 400 error when no project id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.updateSurvey();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path parameter: projectId');
    }
  });

  it('should throw a 400 error when no survey id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.updateSurvey();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path parameter: surveyId');
    }
  });

  it('should throw a 400 error when no request body present', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.updateSurvey();

      await result({ ...sampleReq, body: null }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required request body');
    }
  });

  it('should throw a 400 error when no revision count', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.updateSurvey();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, survey_details: { revision_count: null } } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to parse request body');
    }
  });

  it('should throw a 400 error when no sql statement returned', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(null);

    try {
      const result = update.updateSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL update statement');
    }
  });

  it('should throw a 409 error when no result or rowCount', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null, rowCount: 0 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(SQL`some query`);

    try {
      const result = update.updateSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(409);
      expect(actualError.message).to.equal('Failed to update stale survey data');
    }
  });

  it('should send a valid HTTP response on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(SQL`some query`);

    const result = update.updateSurvey();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(200);
  });
});
