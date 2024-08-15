import chai, { expect } from 'chai';
import FormData from 'form-data';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { BctwKeyxService } from '../bctw-service/bctw-keyx-service';

chai.use(sinonChai);

describe('BctwKeyxService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockUser = { keycloak_guid: 'abc123', username: 'testuser' };

  const bctwKeyxService = new BctwKeyxService(mockUser);

  describe('uploadKeyX', () => {
    it('should send a post request', async () => {
      const mockAxios = sinon
        .stub(bctwKeyxService.axiosInstance, 'post')
        .resolves({ data: { results: [], errors: [] } });

      const mockMulterFile = { buffer: 'buffer', originalname: 'originalname' } as unknown as Express.Multer.File;

      sinon.stub(FormData.prototype, 'append');

      const mockGetFormDataHeaders = sinon
        .stub(FormData.prototype, 'getHeaders')
        .resolves({ 'content-type': 'multipart/form-data' });

      const result = await bctwKeyxService.uploadKeyX(mockMulterFile);

      expect(mockGetFormDataHeaders).to.have.been.calledOnce;
      expect(result).to.eql({ totalKeyxFiles: 0, newRecords: 0, existingRecords: 0 });
      expect(mockAxios).to.have.been.calledOnce;
    });

    it('should throw an error if the response body has errors', async () => {
      sinon
        .stub(bctwKeyxService.axiosInstance, 'post')
        .resolves({ data: { results: [], errors: [{ error: 'error' }] } });

      const mockMulterFile = { buffer: 'buffer', originalname: 'originalname' } as unknown as Express.Multer.File;

      sinon.stub(FormData.prototype, 'append');

      sinon.stub(FormData.prototype, 'getHeaders').resolves({ 'content-type': 'multipart/form-data' });

      await bctwKeyxService
        .uploadKeyX(mockMulterFile)
        .catch((e) => expect(e.message).to.equal('API request failed with errors'));
    });
  });
});
