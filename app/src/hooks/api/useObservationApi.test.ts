import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useObservationApi from 'hooks/api/useObservationApi';

describe('useObservationApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('uploadCsvForImport', () => {
    it('works as expected', async () => {
      const projectId = 1;
      const surveyId = 2;
      const file = new File([''], 'file.txt', { type: 'application/plain' });

      const res = {
        submissionId: 1
      };

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/upload`).reply(200, res);

      const result = await useObservationApi(axios).uploadCsvForImport(projectId, surveyId, file);

      expect(result).toEqual(res);
    });
  });

  describe('processCsvSubmission', () => {
    it('works as expected', async () => {
      const projectId = 1;
      const surveyId = 2;
      const submissionId = 3;

      const res = undefined;

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/process`).reply(200, res);

      const result = await useObservationApi(axios).processCsvSubmission(projectId, surveyId, submissionId);

      expect(result).toEqual(res);
    });

    it('works as expected with options', async () => {
      const projectId = 1;
      const surveyId = 2;
      const submissionId = 3;
      const options = {
        surveySamplePeriodId: 4
      };

      const res = undefined;

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/process`).reply(200, res);

      const result = await useObservationApi(axios).processCsvSubmission(projectId, surveyId, submissionId, options);

      expect(result).toEqual(res);
    });
  });
});
