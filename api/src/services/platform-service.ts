import axios from 'axios';
import FormData from 'form-data';
import { KeycloakService } from './keycloak-service';

export interface IDwCADataset {
  archiveFile: {
    /**
     * A Darwin Core Archive (DwCA) zip file.
     */
    data: Buffer;
    fileName: string;
    mimeType: string;
  };
  /**
   * A UUID that uniquely identifies this DwCA dataset.
   */
  dataPackageId: string;
}

export class PlatformService {
  BACKBONE_API_HOST = process.env.BACKBONE_API_HOST;
  BACKBONE_API_INGEST_PATH = '/api/dwc/dataset/create';

  /**
   * Submit a new Darwin Core Archive (DwCA) data package to the BioHub Platform Backbone.
   *
   * @param {IDwCADataset} dwcaDataset
   * @return {*}  {Promise<{ data_package_id: string }>}
   * @memberof PlatformService
   */
  async submitNewDataPackage(dwcaDataset: IDwCADataset): Promise<{ data_package_id: string }> {
    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakToken();

    const formData = new FormData();

    formData.append('media', dwcaDataset.archiveFile.data, {
      filename: dwcaDataset.archiveFile.fileName,
      contentType: dwcaDataset.archiveFile.mimeType
    });

    formData.append('data_package_id', dwcaDataset.dataPackageId);

    const { data } = await axios.post<{ data_package_id: string }>(
      `${this.BACKBONE_API_HOST}${this.BACKBONE_API_INGEST_PATH}`,
      formData,
      {
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    );

    return data;
  }
}
