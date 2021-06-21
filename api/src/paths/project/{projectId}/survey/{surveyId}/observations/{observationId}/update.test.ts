import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as update from './update';
import * as db from '../../../../../../../database/db';
import * as observation_update_queries from '../../../../../../../queries/observation/observation-update-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('getObservationForUpdate', () => {
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
      surveyId: 1,
      observationId: 1
    },
    query: {
      entity: 'block'
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

  it('should throw a 400 error when no project id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.getObservationForUpdate();

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

  it('should throw a 400 error when no survey id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.getObservationForUpdate();

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

  it('should throw a 400 error when no observation id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.getObservationForUpdate();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, observationId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `observationId`');
    }
  });

  it('should throw a 400 error when no entity query param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.getObservationForUpdate();

      await result(
        { ...sampleReq, query: { ...sampleReq.query, entity: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required query param `entity`');
    }
  });

  it('should throw a 400 error when no sql statement returned for block observation', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(observation_update_queries, 'getBlockObservationSQL').returns(null);

    try {
      const result = update.getObservationForUpdate();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when entity is not valid', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.getObservationForUpdate();

      await result(
        { ...sampleReq, query: { entity: 'incorrect' } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return only block observation details when entity type is block, on success', async () => {
    const blockObservationDetails = {
      id: 1,
      data: {
        metaData: {
          key: 'value'
        },
        tableData: {
          key: 'value'
        }
      }
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [blockObservationDetails]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(observation_update_queries, 'getBlockObservationSQL').returns(SQL`some query`);

    const result = update.getObservationForUpdate();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      id: 1,
      data: {
        metaData: {
          key: 'value'
        },
        tableData: {
          key: 'value'
        }
      }
    });
  });

  it('should return only block observation details when entity type is block, on no result (null)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: null
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(observation_update_queries, 'getBlockObservationSQL').returns(SQL`some query`);

    const result = update.getObservationForUpdate();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});

describe('updateObservation', () => {
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
      surveyId: 1,
      observationId: 1
    },
    body: {
      observation_type: 'block',
      observation_details_data: {
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

  it('should throw a 400 error when no project id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.updateObservation();

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
      const result = update.updateObservation();

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

  it('should throw a 400 error when no observation id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.updateObservation();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, observationId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path parameter: observationId');
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
      const result = update.updateObservation();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, observation_type: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required body param `observation_type`');
    }
  });

  it('should throw a 400 error when no observation_details_data present', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = update.updateObservation();

      await result(
        { ...sampleReq, body: { observation_type: 'block', observation_details_data: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required body param `observation_details_data`');
    }
  });

  it('should throw a 400 error when no sql statement returned for put block observation', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(observation_update_queries, 'updateBlockObservationSQL').returns(null);

    try {
      const result = update.updateObservation();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL update statement');
    }
  });

  it('should return true when update is successful', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(observation_update_queries, 'updateBlockObservationSQL').returns(SQL`some query`);

    const result = update.updateObservation();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(true);
  });
});
