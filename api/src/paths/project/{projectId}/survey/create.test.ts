import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as create from './create';
import * as db from '../../../../database/db';
import * as survey_create_queries from '../../../../queries/survey/survey-create-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('createSurvey', () => {
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
    body: {
      biologist_first_name: 'Roanna',
      biologist_last_name: 'Brown',
      category_rationale: 'rationale',
      data_sharing_agreement_required: 'false',
      end_date: '2080-12-30',
      first_nations_id: 0,
      foippa_requirements_accepted: true,
      management_unit: 'Management unit 1',
      park: 'Park name 1',
      proprietary_data_category: 1,
      proprietor_name: 'test name',
      sedis_procedures_accepted: true,
      focal_species: [],
      ancillary_species: [],
      start_date: '1925-12-23',
      survey_area_name: 'Armand French',
      survey_data_proprietary: 'true',
      survey_name: 'Odysseus Noel',
      survey_purpose: 'Sint temporibus aut'
    },
    params: {
      projectId: 1
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create.createSurvey();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `projectId`');
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
      const result = create.createSurvey();

      await result({ ...sampleReq, body: null }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing survey data');
    }
  });

  it('should throw a 400 error when no sql statement returned for postSurveySQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_create_queries, 'postSurveySQL').returns(null);

    try {
      const result = create.createSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build survey SQL insert statement');
    }
  });

  it('should throw a 400 error when the create survey fails because result has no id', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: null }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_create_queries, 'postSurveySQL').returns(SQL`some query`);

    try {
      const result = create.createSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert survey data');
    }
  });

  it('should throw a 400 error when the create survey fails because result has no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_create_queries, 'postSurveySQL').returns(SQL`some query`);

    try {
      const result = create.createSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert survey data');
    }
  });

  it('should throw a 400 error when no sql statement returned for postSurveyProprietorSQL', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: 1 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_create_queries, 'postSurveySQL').returns(SQL`something`);
    sinon.stub(survey_create_queries, 'postSurveyProprietorSQL').returns(null);
    sinon.stub(create, 'insertSurveyPermit').resolves(true);

    try {
      const result = create.createSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL insert statement');
    }
  });

  it('should return the survey id on success (no proprietary data)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: 23 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_create_queries, 'postSurveySQL').returns(SQL`something`);
    sinon.stub(create, 'insertSurveyPermit').resolves(true);

    const result = create.createSurvey();

    await result(
      { ...sampleReq, body: { ...sampleReq.body, survey_data_proprietary: 'false' } },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.eql({
      id: 23
    });
  });

  it('should return the survey id on success with focal and ancillary species (no proprietary data)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: 23 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_create_queries, 'postSurveySQL').returns(SQL`something`);
    sinon.stub(create, 'insertFocalSpecies').resolves(1);
    sinon.stub(create, 'insertAncillarySpecies').resolves(1);
    sinon.stub(create, 'insertSurveyPermit').resolves(true);

    const result = create.createSurvey();

    await result(
      {
        ...sampleReq,
        body: {
          ...sampleReq.body,
          survey_data_proprietary: 'false',
          focal_species: ['species 1'],
          ancillary_species: ['ancill1']
        }
      },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.eql({
      id: 23
    });
  });

  it('should return the survey id on success (with proprietary data)', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({ rows: [{ id: 23 }] })
      .onSecondCall()
      .resolves({ rows: [{ id: 23 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_create_queries, 'postSurveySQL').returns(SQL`something`);
    sinon.stub(survey_create_queries, 'postSurveyProprietorSQL').returns(SQL`something else`);
    sinon.stub(create, 'insertSurveyPermit').resolves(true);

    const result = create.createSurvey();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      id: 23
    });
  });

  it('should throw a 400 error when the create survey fails because survey proprietor result has no id', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({ rows: [{ id: 23 }] })
      .onSecondCall()
      .resolves({ rows: [{ id: null }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_create_queries, 'postSurveySQL').returns(SQL`some query`);
    sinon.stub(survey_create_queries, 'postSurveyProprietorSQL').returns(SQL`something else`);
    sinon.stub(create, 'insertSurveyPermit').resolves(true);

    try {
      const result = create.createSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert survey proprietor data');
    }
  });

  it('should throw a 400 error when the create survey fails because survey proprietor result has no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({ rows: [{ id: 23 }] })
      .onSecondCall()
      .resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_create_queries, 'postSurveySQL').returns(SQL`some query`);
    sinon.stub(survey_create_queries, 'postSurveyProprietorSQL').returns(SQL`something else`);
    sinon.stub(create, 'insertSurveyPermit').resolves(true);

    try {
      const result = create.createSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert survey proprietor data');
    }
  });
});

describe('insertFocalSpecies', () => {
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

  const focalSpeciesId = 1;
  const surveyId = 2;

  it('should throw an error when cannot generate post sql statement', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(survey_create_queries, 'postFocalSpeciesSQL').returns(null);

    try {
      await create.insertFocalSpecies(focalSpeciesId, surveyId, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL insert statement');
    }
  });

  it('should throw a HTTP 400 error when failed to insert focal species data cause result is null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [null] });

    sinon.stub(survey_create_queries, 'postFocalSpeciesSQL').returns(SQL`some`);

    try {
      await create.insertFocalSpecies(focalSpeciesId, surveyId, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert focal species data');
    }
  });

  it('should throw a HTTP 400 error when failed to insert focal species data cause result id is null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: null }] });

    sinon.stub(survey_create_queries, 'postFocalSpeciesSQL').returns(SQL`some`);

    try {
      await create.insertFocalSpecies(focalSpeciesId, surveyId, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert focal species data');
    }
  });

  it('should return the result id on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: 12 }] });

    sinon.stub(survey_create_queries, 'postFocalSpeciesSQL').returns(SQL`some`);

    const res = await create.insertFocalSpecies(focalSpeciesId, surveyId, { ...dbConnectionObj, query: mockQuery });

    expect(res).to.equal(12);
  });
});

describe('insertAncillarySpecies', () => {
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

  const ancillarySpeciesId = 1;
  const surveyId = 2;

  it('should throw an error when cannot generate post sql statement', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(survey_create_queries, 'postAncillarySpeciesSQL').returns(null);

    try {
      await create.insertAncillarySpecies(ancillarySpeciesId, surveyId, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL insert statement');
    }
  });

  it('should throw a HTTP 400 error when failed to insert ancillary species data cause result is null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [null] });

    sinon.stub(survey_create_queries, 'postAncillarySpeciesSQL').returns(SQL`some`);

    try {
      await create.insertAncillarySpecies(ancillarySpeciesId, surveyId, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert ancillary species data');
    }
  });

  it('should throw a HTTP 400 error when failed to insert ancillary species data cause result id is null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: null }] });

    sinon.stub(survey_create_queries, 'postAncillarySpeciesSQL').returns(SQL`some`);

    try {
      await create.insertAncillarySpecies(ancillarySpeciesId, surveyId, { ...dbConnectionObj, query: mockQuery });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert ancillary species data');
    }
  });

  it('should return the result id on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: 12 }] });

    sinon.stub(survey_create_queries, 'postAncillarySpeciesSQL').returns(SQL`some`);

    const res = await create.insertAncillarySpecies(ancillarySpeciesId, surveyId, {
      ...dbConnectionObj,
      query: mockQuery
    });

    expect(res).to.equal(12);
  });
});
