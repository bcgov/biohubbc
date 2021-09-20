import { AxiosInstance } from 'axios';

/**
 * Returns a set of supported api methods for working with n8n webhooks.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useN8NApi = (axios: AxiosInstance) => {
  // Initiate the validation process for the submitted observations using n8n webhook
  const initiateSubmissionValidation = async (submissionId: number, fileType: string) => {
    await axios.post('/webhook/validate', {
      occurrence_submission_id: submissionId,
      file_type: fileType
    });
  };

  // Initiate the scraping process for the submitted occurrence using n8n webhook
  const initiateScrapeOccurrences = async (submissionId: number) => {
    await axios.post('/webhook/scrape', {
      occurrence_submission_id: submissionId
    });
  };

  return {
    initiateSubmissionValidation,
    initiateScrapeOccurrences
  };
};

export default useN8NApi;
