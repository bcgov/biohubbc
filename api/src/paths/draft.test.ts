import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as draft from './draft';
import * as db from '../database/db';
import * as draft_queries from '../queries/draft-queries';
import { QueryResult } from 'pg';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('draft', () => {
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
      id: 1,
      name: 'name',
      data: {}
    }
  } as any;

  let actualResult = {
    id: null,
    date: null
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

  describe('createDraft', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no system user id', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = draft.createDraft();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to identify system user ID');
      }
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });
      sinon.stub(draft_queries, 'postDraftSQL').returns(null);

      try {
        const result = draft.createDraft();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to build SQL insert statement');
      }
    });

    it('should throw a 400 error when missing request body param name', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      try {
        const result = draft.createDraft();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, name: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing required param name');
      }
    });

    it('should throw a 400 error when missing request body param data', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      try {
        const result = draft.createDraft();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, data: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing required param data');
      }
    });

    it('should throw a 400 error when no id in result', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rowCount: 1,
            rows: [
              {
                id: null
              }
            ]
          } as QueryResult<any>;
        }
      });

      sinon.stub(draft_queries, 'postDraftSQL').returns(SQL`some query`);

      try {
        const result = draft.createDraft();

        await result(sampleReq, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to save draft');
      }
    });

    it('should throw a 400 error when no result', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rows: null
          } as any;
        }
      });

      sinon.stub(draft_queries, 'postDraftSQL').returns(SQL`some query`);

      try {
        const result = draft.createDraft();

        await result(sampleReq, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to save draft');
      }
    });

    it('should return the draft id and update date on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rowCount: 1,
            rows: [
              {
                id: 1,
                create_date: '2020/04/04',
                update_date: '2020/05/05'
              }
            ]
          } as QueryResult<any>;
        }
      });

      sinon.stub(draft_queries, 'postDraftSQL').returns(SQL`some query`);

      const result = draft.createDraft();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult.id).to.equal(1);
      expect(actualResult.date).to.equal('2020/05/05');
    });

    it('should return the draft id and create date on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rowCount: 1,
            rows: [
              {
                id: 1,
                create_date: '2020/04/04'
              }
            ]
          } as QueryResult<any>;
        }
      });

      sinon.stub(draft_queries, 'postDraftSQL').returns(SQL`some query`);

      const result = draft.createDraft();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult.id).to.equal(1);
      expect(actualResult.date).to.equal('2020/04/04');
    });

    it('should throw an error when a failure occurs', async () => {
      const expectedError = new Error('cannot process query');

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          throw expectedError;
        }
      });

      try {
        const result = draft.createDraft();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.message).to.equal(expectedError.message);
      }
    });
  });

  describe('updateDraft', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when missing request body param id', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      try {
        const result = draft.updateDraft();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, id: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing required param id');
      }
    });

    it('should throw a 400 error when missing request body param name', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      try {
        const result = draft.updateDraft();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, name: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing required param name');
      }
    });

    it('should throw a 400 error when missing request body param data', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      try {
        const result = draft.updateDraft();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, data: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing required param data');
      }
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });
      sinon.stub(draft_queries, 'putDraftSQL').returns(null);

      try {
        const result = draft.updateDraft();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to build SQL update statement');
      }
    });

    it('should throw a 400 error when no id in result', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rowCount: 1,
            rows: [
              {
                id: null
              }
            ]
          } as QueryResult<any>;
        }
      });

      sinon.stub(draft_queries, 'putDraftSQL').returns(SQL`some query`);

      try {
        const result = draft.updateDraft();

        await result(sampleReq, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to update draft');
      }
    });

    it('should throw a 400 error when no result', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rows: null
          } as any;
        }
      });

      sinon.stub(draft_queries, 'putDraftSQL').returns(SQL`some query`);

      try {
        const result = draft.updateDraft();

        await result(sampleReq, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to update draft');
      }
    });

    it('should return the draft id and update date on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rowCount: 1,
            rows: [
              {
                id: 1,
                create_date: '2020/04/04',
                update_date: '2020/05/05'
              }
            ]
          } as QueryResult<any>;
        }
      });

      sinon.stub(draft_queries, 'putDraftSQL').returns(SQL`some query`);

      const result = draft.updateDraft();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult.id).to.equal(1);
      expect(actualResult.date).to.equal('2020/05/05');
    });

    it('should return the draft id and create date on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rowCount: 1,
            rows: [
              {
                id: 1,
                create_date: '2020/04/04'
              }
            ]
          } as QueryResult<any>;
        }
      });

      sinon.stub(draft_queries, 'putDraftSQL').returns(SQL`some query`);

      const result = draft.updateDraft();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult.id).to.equal(1);
      expect(actualResult.date).to.equal('2020/04/04');
    });
  });
});
