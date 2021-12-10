import { AxiosInstance } from 'axios';

/**
 * Returns a set of supported api methods for working with n8n webhooks.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useN8NApi = (axios: AxiosInstance) => {
  /**
   * Initiate the validation process for the submitted observations using n8n webhook
   *
   * @param {number} projectId
   * @param {number} submissionId
   * @param {string} fileType
   */
  const initiateSubmissionValidation = async (projectId: number, submissionId: number, fileType: string) => {
    await axios.post('/webhook/validate', {
      project_id: projectId,
      occurrence_submission_id: submissionId,
      file_type: fileType
    });
  };

  /**
   * Initiate the transformation process for the submitted observation template using n8n.
   *
   * @param {number} projectId
   * @param {number} submissionId
   */
  const initiateTransformTemplate = async (projectId: number, submissionId: number) => {
    await axios.post('/webhook/transform', {
      project_id: projectId,
      occurrence_submission_id: submissionId
    });
  };

  /**
   * Initiate the scraping process for the submitted occurrence using n8n webhook
   *
   * @param {number} projectId
   * @param {number} submissionId
   */
  const initiateScrapeOccurrences = async (projectId: number, submissionId: number) => {
    await axios.post('/webhook/scrape', {
      project_id: projectId,
      occurrence_submission_id: submissionId
    });
  };

  /**
   * Initiate the validation, transformation, and scraping processes for the submitted observation file using n8n.
   *
   * @param {number} projectId
   * @param {number} submissionId
   * @param {string} fileType
   */
  const initiateOccurrenceSubmissionProcessing = async (projectId: number, submissionId: number, fileType: string) => {
    await axios.post('/webhook/process-occurrence-submission', {
      project_id: projectId,
      occurrence_submission_id: submissionId,
      file_type: fileType
    });
  };

  return {
    initiateSubmissionValidation,
    initiateTransformTemplate,
    initiateScrapeOccurrences,
    initiateOccurrenceSubmissionProcessing
  };
};

export default useN8NApi;
