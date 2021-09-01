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

  return {
    initiateSubmissionValidation
  };
};

export default useN8NApi;
