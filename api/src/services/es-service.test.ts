import { Client } from '@elastic/elasticsearch';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ESService } from './es-service';

chai.use(sinonChai);

describe('ESService', () => {
  describe('getEsClient', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return new elastic search client', async () => {
      const esService = new ESService();

      const clientStub = sinon.stub().callsFake(() => {
        return 'test';
      });

      Object.setPrototypeOf(Client, clientStub);

      esService.getEsClient();

      expect(clientStub).to.be.calledOnce;
    });
  });
});
