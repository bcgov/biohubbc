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
      species: 'Alkaline Wing-nerved Moss [Pterygoneurum kozlovii]',
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

  // let actualResult: any = null;

  // const sampleRes = {
  //   status: () => {
  //     return {
  //       json: (result: any) => {
  //         actualResult = result;
  //       }
  //     };
  //   }
  // };

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
      expect(actualError.message).to.equal('Failed to create the survey record');
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
      expect(actualError.message).to.equal('Failed to create the survey record');
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

    try {
      const result = create.createSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build survey_proprietor SQL insert statement');
    }
  });
});
