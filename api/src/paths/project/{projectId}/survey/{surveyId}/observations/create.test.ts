import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as create from './create';
import * as db from '../../../../../../database/db';
import * as observation_create_queries from '../../../../../../queries/observation/observation-create-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);
describe('createBlockObservation', () => {
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
      observation_type: 'block',
      observation_post_data: {
        block_name: 'block_name',
        start_datetime: '2021-06-01T01:06:00.000Z',
        end_datetime: '2021-06-01T02:06:00.000Z',
        observation_count: 50,
        observation_data: {
          metaData: { block_name: 'block_name' },
          tableData: {
            data: [['1', '2']]
          }
        }
      }
    },
    params: {
      surveyId: 1
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

  it('should throw an error when surveyId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create.createObservation();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should throw a 400 error when no observation_type is present', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = create.createObservation();

      await result(
        { ...sampleReq, body: { observation_type: null, observation_post_data: sampleReq.body.observation_post_data } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      console.log('actualError', actualError);
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required body param `observation_type`');
    }
  });

  it('should throw a 400 error when no observation_post_data is present', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = create.createObservation();

      await result(
        { ...sampleReq, body: { observation_type: 'block', observation_post_data: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      console.log('actualError', actualError);
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required body param `observation_post_data`');
    }
  });

  it('should throw a 400 error when no sql statement returned for postBlockObservationSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(observation_create_queries, 'postBlockObservationSQL').returns(null);

    try {
      const result = create.createObservation();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build observation SQL insert statement');
    }
  });

  it('should throw a 400 error when the create observation fails because result has no id', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: null }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(observation_create_queries, 'postBlockObservationSQL').returns(SQL`some query`);

    try {
      const result = create.createObservation();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert observation data');
    }
  });

  it('should return the observation id on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rows: [{ id: 23 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(observation_create_queries, 'postBlockObservationSQL').returns(SQL`something`);

    const result = create.createObservation();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      id: 23
    });
  });
});
