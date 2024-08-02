import FormData from 'form-data';
import { GET_KEYX_STATUS_ENDPOINT, UPLOAD_KEYX_ENDPOINT } from '../../constants/bctw-routes';
import { ApiError, ApiErrorType } from '../../errors/api-error';
import { IKeyXDetails, IUploadKeyxResponse } from '../../models/bctw';
import { BctwService } from './bctw-service';

export class BctwKeyxService extends BctwService {
  /**
   * Upload a single or multiple zipped keyX files to the BCTW API.
   *
   * @param {Express.Multer.File} keyX
   * @return {*}  {Promise<string>}
   * @memberof BctwKeyxService
   */
  async uploadKeyX(keyX: Express.Multer.File) {
    const formData = new FormData();
    formData.append('xml', keyX.buffer, keyX.originalname);
    const config = {
      headers: {
        ...formData.getHeaders()
      }
    };
    const response = await this.axiosInstance.post(UPLOAD_KEYX_ENDPOINT, formData, config);
    const data: IUploadKeyxResponse = response.data;
    if (data.errors.length) {
      const actualErrors: string[] = [];
      for (const error of data.errors) {
        // Ignore errors that indicate that a keyX already exists
        if (!error.error.endsWith('already exists')) {
          actualErrors.push(error.error);
        }
      }
      if (actualErrors.length) {
        throw new ApiError(ApiErrorType.UNKNOWN, 'API request failed with errors', actualErrors);
      }
    }
    return {
      totalKeyxFiles: data.results.length + data.errors.length,
      newRecords: data.results.length,
      existingRecords: data.errors.length
    };
  }

  async getKeyXDetails(deviceIds: number[]): Promise<IKeyXDetails[]> {
    return this._makeGetRequest(GET_KEYX_STATUS_ENDPOINT, { device_ids: deviceIds.map((id) => String(id)) });
  }
}
