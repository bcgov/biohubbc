import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as permit_no_sampling from './permit-no-sampling';
import * as db from '../database/db';

chai.use(sinonChai);

describe('permit-no-sampling', () => {
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
      coordinator: {
        first_name: 'first',
        last_name: 'last',
        email_address: 'email@example.com',
        coordinator_agency: 'agency',
        share_contact_details: true
      },
      permit: {
        permits: [
          {
            permit_number: 'number',
            permit_type: 'type'
          }
        ]
      }
    }
  } as any;

  let actualResult = {
    ids: null
  };

  const sampleRes = {
    status: (status: number) => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  describe('createNoSamplePermits', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no permit passed in request body', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = permit_no_sampling.createNoSamplePermits();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, permit: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing request body param `permit`');
      }
    });

    it('should throw a 400 error when no coordinator passed in request body', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = permit_no_sampling.createNoSamplePermits();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, coordinator: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing request body param `coordinator`');
      }
    });

    it('should return the inserted ids on success', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(permit_no_sampling, 'insertNoSamplePermit').resolves(20);

      const result = permit_no_sampling.createNoSamplePermits();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult.ids).to.eql([20]);
    });

    it('should throw an error when a failure occurs', async () => {
      const expectedError = new Error('cannot process request');

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(permit_no_sampling, 'insertNoSamplePermit').rejects(expectedError);

      try {
        const result = permit_no_sampling.createNoSamplePermits();

        await result(sampleReq, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.message).to.equal(expectedError.message);
      }
    });
  });
});
