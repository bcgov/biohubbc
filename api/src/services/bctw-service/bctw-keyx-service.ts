import FormData from 'form-data';
import { z } from 'zod';
import { ApiError, ApiErrorType } from '../../errors/api-error';
import { checkFileForKeyx } from '../../utils/media/media-utils';
import { BctwService } from './bctw-service';

export const BctwUploadKeyxResponse = z.object({
  errors: z.array(
    z.object({
      row: z.string(),
      error: z.string(),
      rownum: z.number()
    })
  ),
  results: z.array(
    z.object({
      idcollar: z.number(),
      comtype: z.string(),
      idcom: z.string(),
      collarkey: z.string(),
      collartype: z.number(),
      dtlast_fetch: z.string().nullable()
    })
  )
});
export type BctwUploadKeyxResponse = z.infer<typeof BctwUploadKeyxResponse>;

export const BctwKeyXDetails = z.object({
  device_id: z.number(),
  keyx: z
    .object({
      idcom: z.string(),
      comtype: z.string(),
      idcollar: z.number(),
      collarkey: z.string(),
      collartype: z.number()
    })
    .nullable()
});
export type BctwKeyXDetails = z.infer<typeof BctwKeyXDetails>;

export class BctwKeyxService extends BctwService {
  /**
   * Upload a single or multiple zipped keyX files to the BCTW API.
   *
   * @param {Express.Multer.File} keyX
   * @return {*}  {Promise<string>}
   * @memberof BctwKeyxService
   */
  async uploadKeyX(keyX: Express.Multer.File) {
    const isValidKeyX = checkFileForKeyx(keyX);

    if (isValidKeyX.error) {
      throw new ApiError(ApiErrorType.GENERAL, isValidKeyX.error);
    }

    const formData = new FormData();

    formData.append('xml', keyX.buffer, keyX.originalname);

    const config = {
      headers: {
        ...formData.getHeaders()
      }
    };

    const response = await this.axiosInstance.post('/import-xml', formData, config);

    const data: BctwUploadKeyxResponse = response.data;

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

  async getKeyXDetails(deviceIds: number[]): Promise<BctwKeyXDetails[]> {
    const { data } = await this.axiosInstance.get('/get-collars-keyx', {
      params: {
        device_ids: deviceIds.map((id) => String(id))
      }
    });

    return data;
  }
}
