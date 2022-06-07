import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import survey_queries from '../../../../../queries/survey';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import * as create from '../create';
import * as update from './update';

chai.use(sinonChai);

describe('updateSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no project id path param', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '',
      surveyId: '2'
    };
    mockReq.body = {
      survey_details: {
        survey_name: 'name',
        species: 'species',
        start_date: '2020-03-03',
        end_date: '2020-04-04',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        revision_count: 1,
        geometry: []
      }
    };

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = update.updateSurvey();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path parameter: projectId');
    }
  });

  it('should throw a 400 error when no survey id path param', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: ''
    };
    mockReq.body = {
      survey_details: {
        survey_name: 'name',
        species: 'species',
        start_date: '2020-03-03',
        end_date: '2020-04-04',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        revision_count: 1,
        geometry: []
      }
    };

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = update.updateSurvey();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path parameter: surveyId');
    }
  });

  it('should throw a 400 error when no request body present', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = null;

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = update.updateSurvey();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required request body');
    }
  });

  it('should throw a 400 error when no revision count', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      survey_details: {
        survey_name: 'name',
        species: 'species',
        start_date: '2020-03-03',
        end_date: '2020-04-04',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        revision_count: null,
        geometry: []
      }
    };

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = update.updateSurvey();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to parse request body');
    }
  });

  it('should throw a 400 error when no sql statement returned (surveyDetails)', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      survey_details: {
        survey_name: 'name',
        species: 'species',
        start_date: '2020-03-03',
        end_date: '2020-04-04',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        revision_count: 1,
        geometry: []
      }
    };

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(null);

    try {
      const requestHandler = update.updateSurvey();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL update statement');
    }
  });

  it('should throw a 409 error when no result or rowCount (surveyDetails)', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      survey_details: {
        survey_name: 'name',

        species: 'species',
        start_date: '2020-03-03',
        end_date: '2020-04-04',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        revision_count: 1,
        geometry: []
      }
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null, rowCount: 0 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`some query`);

    try {
      const requestHandler = update.updateSurvey();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(409);
      expect((actualError as HTTPError).message).to.equal('Failed to update stale survey data');
    }
  });

  it('should send a valid HTTP response on success (with only survey_details)', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      survey_details: {
        survey_name: 'name',
        species: 'species',
        start_date: '2020-03-03',
        end_date: '2020-04-04',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        revision_count: 1,
        geometry: []
      }
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`some query`);

    const requestHandler = update.updateSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });

  it('should send a valid HTTP response on success (with only survey proprietor data)', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      survey_proprietor: {
        survey_data_proprietary: 'false',
        id: 0
      }
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`some query`);

    const requestHandler = update.updateSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });

  it('should send a valid HTTP response on success (did have proprietor data and no longer requires proprietor data)', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      survey_details: {
        survey_name: 'name',
        species: 'species',
        start_date: '2020-03-03',
        end_date: '2020-04-04',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        revision_count: 1,
        geometry: []
      },
      survey_proprietor: {
        survey_data_proprietary: 'false',
        id: 0
      }
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'deleteSurveyProprietorSQL').returns(SQL`some query`);

    const requestHandler = update.updateSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });

  it('should throw HTTP 400 error when no sql statement (did have proprietor data and no longer requires proprietor data)', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      survey_details: {
        survey_name: 'name',
        species: 'species',
        start_date: '2020-03-03',
        end_date: '2020-04-04',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        revision_count: 1,
        geometry: []
      },
      survey_proprietor: {
        survey_data_proprietary: 'false',
        id: 1
      }
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'deleteSurveyProprietorSQL').returns(null);

    try {
      const requestHandler = update.updateSurvey();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL statement');
    }
  });
});

describe('updateSurveyProprietorData', () => {
  afterEach(() => {
    sinon.restore();
  });

  const surveyId = 2;
  const entities: update.IUpdateSurvey = {
    survey_details: {
      id: 1,
      survey_name: 'survey name',
      revision_count: 0,
      focal_species: [1],
      ancillary_species: [2]
    },
    survey_purpose_and_methodology: {},
    survey_proprietor: {
      id: 0,
      survey_data_proprietary: 'true'
    }
  };

  it('should throw a 400 error when fails to build sql statement in case 3', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(survey_queries, 'postSurveyProprietorSQL').returns(null);

    try {
      await update.updateSurveyProprietorData(surveyId, entities, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL statement');
    }
  });

  it('should throw a 400 error when no rowCount in result in case 3', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: null });

    sinon.stub(survey_queries, 'postSurveyProprietorSQL').returns(SQL`some`);

    try {
      await update.updateSurveyProprietorData(surveyId, entities, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(409);
      expect((actualError as HTTPError).message).to.equal('Failed to update survey proprietor data');
    }
  });

  it('should throw a 400 error when fails to build sql statement in case 4', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(survey_queries, 'putSurveyProprietorSQL').returns(null);

    try {
      await update.updateSurveyProprietorData(
        surveyId,
        { ...entities, survey_proprietor: { ...entities.survey_proprietor, id: 1 } },
        dbConnectionObj
      );

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL statement');
    }
  });

  it('should throw a 400 error when no rowCount in result in case 4', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: null });

    sinon.stub(survey_queries, 'putSurveyProprietorSQL').returns(SQL`some`);

    try {
      await update.updateSurveyProprietorData(
        surveyId,
        { ...entities, survey_proprietor: { ...entities.survey_proprietor, id: 1 } },
        dbConnectionObj
      );

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(409);
      expect((actualError as HTTPError).message).to.equal('Failed to update survey proprietor data');
    }
  });
});

describe('updateSurveyDetailsData', () => {
  afterEach(() => {
    sinon.restore();
  });

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
    survey_purpose_and_methodology: null,
    survey_proprietor: null
  };

  it('should throw a 400 error when no revision count in data', async () => {
    const dbConnectionObj = getMockDBConnection();

    try {
      await update.updateSurveyDetailsData(
        projectId,
        surveyId,
        (null as unknown) as update.IUpdateSurvey,
        dbConnectionObj
      );

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to parse request body');
    }
  });

  it('should throw a 400 error when no sql statement produced for putSurveyDetailsSQL', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(null);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL update statement');
    }
  });

  it('should throw a 409 error when no rowCount produced for putSurveyDetailsSQL', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: null });

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`something`);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(409);
      expect((actualError as HTTPError).message).to.equal('Failed to update stale survey data');
    }
  });

  it('should throw a 400 error when no sql produced for deleteFocalSpeciesSQL', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteFocalSpeciesSQL').returns(null);
    sinon.stub(survey_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should throw a 400 error when no sql produced for deleteAncillarySpeciesSQL', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteAncillarySpeciesSQL').returns(null);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should throw a 400 error when fails to delete focal species data', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rowCount: 1 }).onSecondCall().resolves(null).onThirdCall().resolves(true);

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(409);
      expect((actualError as HTTPError).message).to.equal('Failed to delete survey focal species data');
    }
  });

  it('should throw a 400 error when fails to delete ancillary species data', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rowCount: 1 }).onSecondCall().resolves(true).onThirdCall().resolves(null);

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(409);
      expect((actualError as HTTPError).message).to.equal('Failed to delete survey ancillary species data');
    }
  });

  it('should throw a 400 error when fails to delete survey funding sources data', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 1 });
    mockQuery.onCall(1).resolves(true);
    mockQuery.onCall(2).resolves(true);
    mockQuery.onCall(3).resolves(null);

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteSurveyFundingSourcesBySurveyIdSQL').returns(SQL`something`);

    try {
      await update.updateSurveyDetailsData(projectId, surveyId, data, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(409);
      expect((actualError as HTTPError).message).to.equal('Failed to delete survey funding sources data');
    }
  });

  it('should return resolved promises on success with focal and ancillary species and funding sources but no permit number', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 1 });
    mockQuery.onCall(1).resolves(true);
    mockQuery.onCall(2).resolves(true);
    mockQuery.onCall(3).resolves(true);

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteSurveyFundingSourcesBySurveyIdSQL').returns(SQL`something`);

    sinon.stub(create, 'insertFocalSpecies').resolves(1);
    sinon.stub(create, 'insertAncillarySpecies').resolves(2);
    sinon.stub(create, 'insertSurveyFundingSource').resolves();
    sinon.stub(update, 'unassociatePermitFromSurvey').resolves();

    const result = await update.updateSurveyDetailsData(
      projectId,
      surveyId,
      { ...data, survey_details: { ...data.survey_details, funding_sources: [12] } },
      {
        ...dbConnectionObj,
        query: mockQuery
      }
    );

    expect(result).to.eql([1, 2, undefined, undefined]);
  });

  it('should return resolved promises on success with focal and ancillary species and funding sources and permit number', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 1 });
    mockQuery.onCall(1).resolves(true);
    mockQuery.onCall(2).resolves(true);
    mockQuery.onCall(3).resolves(true);
    mockQuery.onCall(4).resolves(true);

    sinon.stub(survey_queries, 'putSurveyDetailsSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteFocalSpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteAncillarySpeciesSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteSurveyFundingSourcesBySurveyIdSQL').returns(SQL`something`);

    sinon.stub(create, 'insertFocalSpecies').resolves(1);
    sinon.stub(create, 'insertAncillarySpecies').resolves(2);
    sinon.stub(create, 'insertSurveyFundingSource').resolves();
    sinon.stub(update, 'unassociatePermitFromSurvey').resolves();
    sinon.stub(create, 'insertSurveyPermit').resolves();

    const result = await update.updateSurveyDetailsData(
      projectId,
      surveyId,
      { ...data, survey_details: { ...data.survey_details, permit_number: '123', funding_sources: [12] } },
      {
        ...dbConnectionObj,
        query: mockQuery
      }
    );

    expect(result).to.eql([1, 2, undefined, undefined, undefined]);
  });
});

describe('unassociatePermitFromSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const surveyId = 1;

  it('should throw a 400 error when no sql statement returned', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(survey_queries, 'unassociatePermitFromSurveySQL').returns(null);

    try {
      await update.unassociatePermitFromSurvey(surveyId, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL update statement');
    }
  });

  it('should throw a 400 error when no result returned', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    mockQuery.resolves(null);

    sinon.stub(survey_queries, 'unassociatePermitFromSurveySQL').returns(SQL`something`);

    try {
      await update.unassociatePermitFromSurvey(surveyId, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to update survey permit number data');
    }
  });
});
