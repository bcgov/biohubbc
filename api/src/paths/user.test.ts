import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../database/db';
import { CustomError } from '../errors/CustomError';
import * as user_queries from '../queries/users/user-queries';
import { getMockDBConnection } from '../__mocks__/db';
import * as user from './user';
import * as system_user from '../paths-helpers/system-user';

chai.use(sinonChai);

describe('user', () => {
  const dbConnectionObj = getMockDBConnection();

  describe('addUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    const sampleReq = {
      keycloak_token: {},
      body: {
        userIdentifier: 'uid',
        identitySource: 'idsource'
      }
    } as any;

    let actualStatus: number = (null as unknown) as number;

    const sampleRes = {
      send: (status: number) => {
        actualStatus = status;
      }
    };

    it('should throw a 400 error when no req body', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addUser();

        await result({ ...(sampleReq as any), body: null }, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as CustomError).status).to.equal(400);
        expect((actualError as CustomError).message).to.equal('Missing required body param: userIdentifier');
      }
    });

    it('should throw a 400 error when no userIdentifier', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addUser();

        await result(
          { ...(sampleReq as any), body: { ...sampleReq.body, userIdentifier: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as CustomError).status).to.equal(400);
        expect((actualError as CustomError).message).to.equal('Missing required body param: userIdentifier');
      }
    });

    it('should throw a 400 error when no identitySource', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addUser();

        await result(
          { ...(sampleReq as any), body: { ...sampleReq.body, identitySource: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as CustomError).status).to.equal(400);
        expect((actualError as CustomError).message).to.equal('Missing required body param: identitySource');
      }
    });

    it('adds a system user and returns 200 on success', async () => {
      const sendStub = sinon.fake();
      const mockRes = { send: sendStub } as any;

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(system_user, 'addSystemUser').resolves();

      const requestHandler = user.addUser();

      await requestHandler(sampleReq, mockRes, (null as unknown) as any);

      expect(sendStub).to.have.been.calledWith(200);
    });

    it('should return status 200 on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rows: [
              {
                id: 1,
                uis_id: 'uis_id',
                user_identifier: 'user_identifier',
                record_effective_date: '2020/04/04'
              }
            ]
          } as QueryResult<any>;
        }
      });

      sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

      const result = user.addUser();

      await result(sampleReq as any, sampleRes as any, (null as unknown) as any);

      expect(actualStatus).to.equal(200);
    });
  });
});
