import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as update from './update';
import * as create from '../create';
import * as db from '../../../../../database/db';
import * as survey_view_update_queries from '../../../../../queries/survey/survey-view-update-queries';
import * as survey_create_queries from '../../../../../queries/survey/survey-create-queries';
import * as survey_update_queries from '../../../../../queries/survey/survey-update-queries';
import * as survey_delete_queries from '../../../../../queries/survey/survey-delete-queries';
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

  it('should throw a 400 error when no survey id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.getSurveyForUpdate();

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

  it('should return only survey details when entity specified with survey_details, on success', async () => {
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
      geometry: [],
      publish_timestamp: null
    };

    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({
      rows: [survey_details]
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

    await result({ ...sampleReq, query: { entity: ['survey_details'] } }, sampleRes as any, (null as unknown) as any);

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
        geometry: survey_details.geometry,
        permit_number: '',
        completion_status: 'Completed',
        publish_date: ''
      },
      survey_proprietor: null
    });
  });

  it('should return survey proprietor info when only survey proprietor entity is specified, on success', async () => {
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

    mockQuery.resolves({
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

    const result = update.getSurveyForUpdate();

    await result(
      { ...sampleReq, query: { entity: ['survey_proprietor'] } },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.eql({
      survey_details: null,
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
      geometry: [],
      publish_timestamp: null
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
        geometry: survey_details.geometry,
        permit_number: '',
        completion_status: 'Completed',
        publish_date: ''
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

  it('should throw a 400 error when no sql statement returned (surveyDetails)', async () => {
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

  it('should throw a 409 error when no result or rowCount (surveyDetails)', async () => {
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

  it('should send a valid HTTP response on success (with only survey_details)', async () => {
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

  it('should send a valid HTTP response on success (with only survey proprietor data)', async () => {
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

    await result(
      { ...sampleReq, body: { survey_proprietor: { survey_data_proprietary: 'false', id: 0 } } },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.equal(200);
  });

  it('should send a valid HTTP response on success (did have proprietor data and no longer requires proprietor data)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_delete_queries, 'deleteSurveyProprietorSQL').returns(SQL`some query`);

    const result = update.updateSurvey();

    await result(
      { ...sampleReq, body: { ...sampleReq.body, survey_proprietor: { survey_data_proprietary: 'false', id: 0 } } },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.equal(200);
  });

  it('should throw HTTP 400 error when no sql statement (did have proprietor data and no longer requires proprietor data)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_delete_queries, 'deleteSurveyProprietorSQL').returns(null);

    try {
      const result = update.updateSurvey();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, survey_proprietor: { survey_data_proprietary: 'false', id: 1 } } },
        sampleRes as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL statement');
    }
  });
});

describe('updateSurveyProprietorData', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = {
    systemUserId: () => {
      return 20;
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

  const surveyId = 2;
  const entities: update.IUpdateSurvey = {
    survey_details: {
      id: 1,
      survey_name: 'survey name',
      revision_count: 0,
      focal_species: [1],
      ancillary_species: [2]
    },
    survey_proprietor: {
      id: 0,
      survey_data_proprietary: 'true'
    }
  };

  it('should throw a 400 error when fails to build sql statement in case 3', async () => {
    sinon.stub(survey_create_queries, 'postSurveyProprietorSQL').returns(null);

    try {
      await update.updateSurveyProprietorData(surveyId, entities, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL statement');
    }
  });

  it('should throw a 400 error when no rowCount in result in case 3', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: null });

    sinon.stub(survey_create_queries, 'postSurveyProprietorSQL').returns(SQL`some`);

    try {
      await update.updateSurveyProprietorData(surveyId, entities, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(409);
      expect(actualError.message).to.equal('Failed to update survey proprietor data');
    }
  });

  it('should throw a 400 error when fails to build sql statement in case 4', async () => {
    sinon.stub(survey_update_queries, 'putSurveyProprietorSQL').returns(null);

    try {
      await update.updateSurveyProprietorData(
        surveyId,
        { ...entities, survey_proprietor: { ...entities.survey_proprietor, id: 1 } },
        dbConnectionObj
      );

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL statement');
    }
  });

  it('should throw a 400 error when no rowCount in result in case 4', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: null });

    sinon.stub(survey_update_queries, 'putSurveyProprietorSQL').returns(SQL`some`);

    try {
      await update.updateSurveyProprietorData(
        surveyId,
        { ...entities, survey_proprietor: { ...entities.survey_proprietor, id: 1 } },
        dbConnectionObj
      );

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(409);
      expect(actualError.message).to.equal('Failed to update survey proprietor data');
    }
  });
});

describe('updateSurveyDetailsData', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = {
    systemUserId: () => {
      return 20;
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

  const projectId = 1;
  const surveyId = 2;
  const data: update.IUpdateSurvey = {
    survey_details: {
      id: 1,
      survey_name: 'survey name',
      revision_count: 0,
      focal_species: [1],
      ancillary_species: [2]
    },
    survey_proprietor: null
  };

  it('should throw a 400 error when no revision count in data', async () => {
    try {
      await update.updateSurveyDetailsData(
        projectId,
        surveyId,
        (null as unknown) as update.IUpdateSurvey,
        dbConnectionObj
      );

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to parse request body');
    }
  });

  it('should throw a 400 error when no sql statement produced for putSurveyDetailsSQL', async () => {
    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(null);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL update statement');
    }
  });

  it('should throw a 409 error when no rowCount produced for putSurveyDetailsSQL', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: null });

    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(SQL`something`);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(409);
      expect(actualError.message).to.equal('Failed to update stale survey data');
    }
  });

  it('should throw a 400 error when no sql produced for deleteFocalSpeciesSQL', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_delete_queries, 'deleteFocalSpeciesSQL').returns(null);
    sinon.stub(survey_delete_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should throw a 400 error when no sql produced for deleteAncillarySpeciesSQL', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_delete_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_delete_queries, 'deleteAncillarySpeciesSQL').returns(null);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should throw a 400 error when fails to delete focal species data', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rowCount: 1 }).onSecondCall().resolves(null).onThirdCall().resolves(true);

    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_delete_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_delete_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(409);
      expect(actualError.message).to.equal('Failed to delete survey focal species data');
    }
  });

  it('should throw a 400 error when fails to delete ancillary species data', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rowCount: 1 }).onSecondCall().resolves(true).onThirdCall().resolves(null);

    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_delete_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_delete_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(409);
      expect(actualError.message).to.equal('Failed to delete survey ancillary species data');
    }
  });

  it('should return true on success with focal and ancillary species', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rowCount: 1 }).onSecondCall().resolves(true).onThirdCall().resolves(true);

    sinon.stub(survey_update_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_delete_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_delete_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);

    sinon.stub(create, 'insertFocalSpecies').resolves(1);
    sinon.stub(create, 'insertAncillarySpecies').resolves(2);

    const result = await update.updateSurveyDetailsData(projectId, surveyId, data, {
      ...dbConnectionObj,
      query: mockQuery
    });

    expect(result).to.eql([1, 2]);
  });
});

describe('getSurveyDetailsData', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = {
    systemUserId: () => {
      return 20;
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

  const surveyId = 1;

  it('should throw a 400 error when no sql statement returned', async () => {
    sinon.stub(survey_view_update_queries, 'getSurveyDetailsForUpdateSQL').returns(null);

    try {
      await update.getSurveyDetailsData(surveyId, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build survey details SQL get statement');
    }
  });

  it('should throw a 400 error when no result returned', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null });

    sinon.stub(survey_view_update_queries, 'getSurveyDetailsForUpdateSQL').returns(SQL`something`);

    try {
      await update.getSurveyDetailsData(surveyId, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to get project survey details data');
    }
  });
});

describe('getSurveyProprietorData', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = {
    systemUserId: () => {
      return 20;
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

  const surveyId = 1;

  it('should throw a 400 error when no sql statement returned', async () => {
    sinon.stub(survey_view_update_queries, 'getSurveyProprietorForUpdateSQL').returns(null);

    try {
      await update.getSurveyProprietorData(surveyId, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build survey proprietor SQL get statement');
    }
  });

  it('should return null when no result returned', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [] });

    sinon.stub(survey_view_update_queries, 'getSurveyProprietorForUpdateSQL').returns(SQL`something`);

    const result = await update.getSurveyProprietorData(surveyId, { ...dbConnectionObj, query: mockQuery });

    expect(result).to.be.null;
  });
});
