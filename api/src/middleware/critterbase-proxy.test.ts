import { expect } from 'chai';
import { Request } from 'express';
import sinon from 'sinon';
import * as CbProxy from './critterbase-proxy';

describe('CritterbaseProxy', () => {
  describe('proxyFilter', () => {
    sinon.stub(CbProxy, 'getSimsAppHostUrl').returns('SIMS');

    it('should reject all requests not coming from SIMS APP', () => {
      expect(CbProxy.proxyFilter('test', { headers: { origin: 'NOT-SIMS' } } as Request)).to.be.false;
    });
    it('should allow requests coming from SIMS APP', () => {
      expect(CbProxy.proxyFilter('test', { headers: { origin: 'SIMS' } } as Request)).to.be.false;
    });

    it('should allow all GET/POST/PATCH requests', () => {
      expect(CbProxy.proxyFilter('test', { method: 'GET', headers: { origin: 'SIMS' } } as Request)).to.be.true;
      expect(CbProxy.proxyFilter('test', { method: 'POST', headers: { origin: 'SIMS' } } as Request)).to.be.true;
      expect(CbProxy.proxyFilter('test', { method: 'PATCH', headers: { origin: 'SIMS' } } as Request)).to.be.true;
    });

    it('should reject unknown request methods', () => {
      expect(CbProxy.proxyFilter('test', { method: 'UNKNOWN', headers: { origin: 'SIMS' } } as Request)).to.be.false;
    });

    it('should allow DELETE requests to capture endpoint', () => {
      expect(
        CbProxy.proxyFilter('/api/critterbase/captures/id', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        CbProxy.proxyFilter('/api/critterbase/captures/id/test', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.false;
    });

    it('should allow DELETE requests to markings endpoint', () => {
      expect(
        CbProxy.proxyFilter('/api/critterbase/markings/id', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        CbProxy.proxyFilter('/api/critterbase/markings/id/test', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.false;
    });

    it('should allow DELETE requests to measurement qualitative endpoint', () => {
      expect(
        CbProxy.proxyFilter('/api/critterbase/measurements/qualitative/id', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        CbProxy.proxyFilter('/api/critterbase/measurements/qualitative/id/test', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.false;
    });

    it('should allow DELETE requests to collection units endpoint', () => {
      expect(
        CbProxy.proxyFilter('/api/critterbase/collectionUnits/id', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        CbProxy.proxyFilter('/api/critterbase/collectionUnits/id/test', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.false;
    });

    it('should allow DELETE requests to collection units endpoint', () => {
      expect(
        CbProxy.proxyFilter('/api/critterbase/mortality/id', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        CbProxy.proxyFilter('/api/critterbase/mortality/id/test', {
          method: 'DELETE',
          headers: { origin: 'SIMS' }
        } as Request)
      ).to.be.false;
    });
  });
});
