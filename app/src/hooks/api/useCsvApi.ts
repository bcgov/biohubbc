import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { useSurveyContext } from 'hooks/useContext';

type ImportSubmission = { submissionId: number };

type CsvApiPath = { upload: string; process: string };

export enum Upload {
  CRITTERS = 'CRITTERS', // Bulk create critters for Manage Animals page
  OBSERVATIONS = 'OBSERVATIONS', // Bulk create Observations for Survey Observations page
  TELEMETRY = 'TELEMETRY' // Bulk create Manual Telemetry for telemetry page
}

/**
 * Actions for uploading and processing CSV files.
 *
 * @param {AxiosInstance} axios
 * @returns {*}
 */
export const useCsvApi = (axios: AxiosInstance) => {
  const { surveyId, projectId } = useSurveyContext();

  /**
   * Get API path for uploading and processing CSV files.
   *
   * @param {Upload} upload - Type of upload ie: CRITTERS
   * @returns {ApiUploadPath} `Upload` and `process` API paths
   */
  const getCsvApiPath = (upload: Upload): CsvApiPath => {
    switch (upload) {
      // TODO: Update these to be the correct paths
      case Upload.CRITTERS:
        return { upload: `/api/project/${projectId}/survey/${surveyId}/critters/upload`, process: `` };
      case Upload.OBSERVATIONS:
        return { upload: `/api/project/${projectId}/survey/${surveyId}/observations/upload`, process: `` };
      case Upload.TELEMETRY:
        return { upload: `TODO`, process: `` };
    }
  };

  /**
   * Uploads a CSV for import and returns import submission ID.
   *
   * @param {Upload} uploadType - CRITTERS / OBSERVATIONS / TELEMETRY...
   * @param {File} file - CSV
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {ImportSubmission} Id of submission
   */
  const uploadCsvForImport = async (
    uploadType: Upload,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<ImportSubmission> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post<ImportSubmission>(getCsvApiPath(uploadType).upload, formData, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Processes an uploaded CSV for import from a known submission ID.
   *
   * @param {Upload} uploadType
   * @param {number} submissionId
   * @return {*}
   */
  const processCsvSubmission = async (uploadType: Upload, submissionId: number) => {
    const { data } = await axios.post(getCsvApiPath(uploadType).process, {
      submission_id: submissionId
    });

    return data;
  };

  return { uploadCsvForImport, processCsvSubmission };
};
