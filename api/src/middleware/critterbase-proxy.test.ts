import { expect } from 'chai';
import { Request } from 'express';
import sinon from 'sinon';
import * as CritterbaseProxy from './critterbase-proxy';
import { proxyFilter } from './critterbase-proxy';

describe('CritterbaseProxy', () => {
  describe('proxyFilter', () => {
    beforeEach(() => {
      sinon.stub(CritterbaseProxy, 'getSimsAppHost').returns('SIMS');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should reject all requests not coming from SIMS APP', () => {
      expect(proxyFilter('test', { headers: { host: 'NOT-SIMS' } } as Request)).to.be.false;
    });

    it('should allow requests coming from SIMS APP', () => {
      expect(proxyFilter('test', { headers: { host: 'SIMS' } } as Request)).to.be.false;
    });

    it('should allow all GET/POST/PATCH requests', () => {
      expect(proxyFilter('test', { method: 'GET', headers: { host: 'SIMS' } } as Request)).to.be.true;
      expect(proxyFilter('test', { method: 'POST', headers: { host: 'SIMS' } } as Request)).to.be.true;
      expect(proxyFilter('test', { method: 'PATCH', headers: { host: 'SIMS' } } as Request)).to.be.true;
    });

    it('should reject unknown request methods', () => {
      expect(proxyFilter('test', { method: 'UNKNOWN', headers: { host: 'SIMS' } } as Request)).to.be.false;
    });

    it('should allow DELETE requests to capture endpoint', () => {
      expect(
        proxyFilter('/api/critterbase/captures/id', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        proxyFilter('/api/critterbase/captures/id/test', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.false;
    });

    it('should allow DELETE requests to markings endpoint', () => {
      expect(
        proxyFilter('/api/critterbase/markings/id', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        proxyFilter('/api/critterbase/markings/id/test', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.false;
    });

    it('should allow DELETE requests to measurement qualitative endpoint', () => {
      expect(
        proxyFilter('/api/critterbase/measurements/qualitative/id', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        proxyFilter('/api/critterbase/measurements/qualitative/id/test', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.false;
    });

    it('should allow DELETE requests to collection units endpoint', () => {
      expect(
        proxyFilter('/api/critterbase/collection-units/id', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        proxyFilter('/api/critterbase/collection-units/id/test', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.false;
    });

    it('should allow DELETE requests to collection units endpoint', () => {
      expect(
        proxyFilter('/api/critterbase/mortality/id', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.true;

      expect(
        proxyFilter('/api/critterbase/mortality/id/test', {
          method: 'DELETE',
          headers: { host: 'SIMS' }
        } as Request)
      ).to.be.false;
    });
  });
});
