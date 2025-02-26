import { expect } from 'chai';
import { getRequestHandlerMocks } from '../__mocks__/db';
import { AsyncRequestStorage, getRequestId, getRequestUser, initRequestStorage } from './async-request-storage';

describe('async-request-storage', () => {
  describe('initRequestStorage', () => {
    it('should set the request id and username in the request store', () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.keycloak_token = { identity_provider: 'idir', idir_username: 'idir_username' } as any;

      const route = () => {
        const store = AsyncRequestStorage.getStore();

        expect(store?.get('requestId')).to.be.a('string');
        expect(store?.get('username')).to.be.equal('idir_username');

        mockNext();
      };

      initRequestStorage(mockReq, mockRes, route);
    });

    it('should set the request id and username in the request store with BCEID username', () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.keycloak_token = { identity_provider: 'bceidbasic', bceid_username: 'bceid_username' } as any;

      const route = () => {
        const store = AsyncRequestStorage.getStore();

        expect(store?.get('requestId')).to.be.a('string');
        expect(store?.get('username')).to.be.equal('bceid_username');

        mockNext();
      };

      initRequestStorage(mockReq, mockRes, route);
    });

    it('should handle multiple requests', () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.keycloak_token = { identity_provider: 'idir', idir_username: 'idir_username' } as any;

      let requestIdA;
      let requestIdB;

      const route = async () => {
        const store = AsyncRequestStorage.getStore();

        requestIdA = store?.get('requestId');

        expect(store?.get('requestId')).to.be.a('string');
        expect(store?.get('username')).to.be.equal('idir_username');

        await new Promise((resolve) => setTimeout(resolve, 100));

        mockNext();
      };

      initRequestStorage(mockReq, mockRes, route);

      const route2 = () => {
        const store = AsyncRequestStorage.getStore();

        requestIdB = store?.get('requestId');

        expect(store?.get('requestId')).to.be.a('string');
        expect(store?.get('username')).to.be.equal('idir_username');

        mockNext();
      };

      initRequestStorage(mockReq, mockRes, route2);

      expect(requestIdA).to.not.be.equal(requestIdB);
    });
  });

  describe('getRequestId', () => {
    it('should return the request id from the request store', () => {
      AsyncRequestStorage.run(new Map([['requestId', 'id']]), () => {
        const value = getRequestId();

        expect(value).to.be.equal('id');
      });
    });

    it('should return the default value if the request store is not initialized', () => {
      const value = getRequestId();

      expect(value).to.be.equal('SYSTEM');
    });

    it('should return the default value if the key is not found in the request store', () => {
      AsyncRequestStorage.run(new Map(), () => {
        const value = getRequestId();

        expect(value).to.be.equal('SYSTEM');
      });
    });
  });

  describe('getRequestUser', () => {
    it('should return the user from the request store', () => {
      AsyncRequestStorage.run(new Map([['username', 'SBRULE']]), () => {
        const value = getRequestUser();

        expect(value).to.be.equal('SBRULE');
      });
    });

    it('should return the default value if the request store is not initialized', () => {
      const value = getRequestUser();

      expect(value).to.be.equal('SYSTEM');
    });

    it('should return the default value if the key is not found in the request store', () => {
      AsyncRequestStorage.run(new Map(), () => {
        const value = getRequestUser();

        expect(value).to.be.equal('SYSTEM');
      });
    });
  });
});
