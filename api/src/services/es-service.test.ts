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

  describe('getItisSearchUrl', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return new elastic search client', async () => {
      process.env.ITIS_SOLR_URL = 'http://itis.test';

      const esService = new ESService();

      const response = await esService.getItisSearchUrl('test');

      expect(response).to.be.equal(
        'http://itis.test?wt=json&sort=nameWOInd+asc&rows=25&q=(nameWOInd:*test*+AND+usage:/(valid|accepted)/)+(vernacular:*test*+AND+usage:/(valid|accepted)/)&omitHeader=true&fl=tsn+scientificName:nameWOInd+kingdom+parentTSN+commonNames:vernacular+updateDate+usage'
      );
    });
  });
});
