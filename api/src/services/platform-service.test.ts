import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { KeycloakService } from './keycloak-service';
import { IDwCADataset, PlatformService } from './platform-service';

chai.use(sinonChai);

describe('PlatformService', () => {
  describe('submitNewDataPackage', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('makes an axios post to the BioHub Platform Backbone API', async () => {
      process.env.BACKBONE_API_HOST = 'backbone.com';

      const keycloakServiceStub = sinon.stub(KeycloakService.prototype, 'getKeycloakToken').resolves('token');

      const axiosStub = sinon.stub(axios, 'post').resolves({ data_package_id: '123-456-789' });

      const dwcaDataset: IDwCADataset = {
        archiveFile: {
          data: Buffer.from([]),
          fileName: 'testFileName',
          mimeType: 'zip'
        },
        dataPackageId: '123-456-789'
      };

      const platformService = new PlatformService();

      await platformService.submitNewDataPackage(dwcaDataset);

      expect(keycloakServiceStub).to.have.been.calledOnce;

      expect(axiosStub).to.have.been.calledOnceWith(
        'backbone.com/api/dwc/dataset/create',
        sinon.match.instanceOf(Buffer),
        {
          headers: {
            authorization: `Bearer token`,
            'content-type': sinon.match(new RegExp(/^multipart\/form-data; boundary=[-]*[0-9]*$/))
          }
        }
      );
    });
  });
});
