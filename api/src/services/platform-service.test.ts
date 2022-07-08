import axios from 'axios';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { EmlService } from './eml-service';
import { KeycloakService } from './keycloak-service';
import { IDwCADataset, PlatformService } from './platform-service';

chai.use(sinonChai);

describe('PlatformService', () => {
  describe('submitDwCAMetadataPackage', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches project EML and submits to the backbone', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const buildProjectEmlStub = sinon.stub(EmlService.prototype, 'buildProjectEml').resolves('xml data');

      sinon.stub(EmlService.prototype, 'packageId').get(() => '123-456-789');

      const _submitDwCADatasetToBioHubBackboneStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHubBackbone')
        .resolves({ data_package_id: '123-456-789' });

      const platformService = new PlatformService(mockDBConnection);

      await platformService.submitDwCAMetadataPackage(1);

      expect(buildProjectEmlStub).to.have.been.calledOnce;
      expect(_submitDwCADatasetToBioHubBackboneStub).to.have.been.calledOnceWith({
        archiveFile: {
          data: sinon.match.any,
          fileName: 'DwCA.zip',
          mimeType: 'application/zip'
        },
        dataPackageId: '123-456-789'
      });
    });
  });

  describe('submitDwCADataPackage', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches project EML and occurrence data and submits to the backbone', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_INTAKE_ENABLED = 'true';

      const buildProjectEmlStub = sinon.stub(EmlService.prototype, 'buildProjectEml').resolves('xml data');

      sinon.stub(EmlService.prototype, 'packageId').get(() => '123-456-789');

      const _submitDwCADatasetToBioHubBackboneStub = sinon
        .stub(PlatformService.prototype, '_submitDwCADatasetToBioHubBackbone')
        .resolves({ data_package_id: '123-456-789' });

      const platformService = new PlatformService(mockDBConnection);

      await platformService.submitDwCADataPackage(1);

      expect(buildProjectEmlStub).to.have.been.calledOnce;
      expect(_submitDwCADatasetToBioHubBackboneStub).to.have.been.calledOnceWith({
        archiveFile: {
          data: sinon.match.any,
          fileName: 'DwCA.zip',
          mimeType: 'application/zip'
        },
        dataPackageId: '123-456-789'
      });
    });
  });

  describe('_submitDwCADatasetToBioHubBackbone', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('makes an axios post to the BioHub Platform Backbone API', async () => {
      const mockDBConnection = getMockDBConnection();

      process.env.BACKBONE_API_HOST = 'http://backbone.com';
      process.env.BACKBONE_INTAKE_PATH = 'api/intake';
      process.env.BACKBONE_INTAKE_ENABLED = 'true';

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

      const platformService = new PlatformService(mockDBConnection);

      await platformService._submitDwCADatasetToBioHubBackbone(dwcaDataset);

      expect(keycloakServiceStub).to.have.been.calledOnce;

      expect(axiosStub).to.have.been.calledOnceWith('http://backbone.com/api/intake', sinon.match.instanceOf(Buffer), {
        headers: {
          authorization: `Bearer token`,
          'content-type': sinon.match(new RegExp(/^multipart\/form-data; boundary=[-]*[0-9]*$/))
        }
      });
    });
  });
});
