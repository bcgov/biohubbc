import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useN8NApi from './useN8NApi';

describe('useN8NApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;
  const submissionId = 2;
  const fileType = 'csv';

  it('initiateSubmissionValidation works as expected', async () => {
    mock.onPost('/webhook/validate').reply(200);

    const result = await useN8NApi(axios).initiateSubmissionValidation(projectId, submissionId, fileType);

    expect(result).toEqual(undefined);
  });

  it('initiateTransformTemplate works as expected', async () => {
    mock.onPost('/webhook/transform').reply(200);

    const result = await useN8NApi(axios).initiateTransformTemplate(projectId, submissionId);

    expect(result).toEqual(undefined);
  });

  it('initiateScrapeOccurrences works as expected', async () => {
    mock.onPost('/webhook/scrape').reply(200);

    const result = await useN8NApi(axios).initiateScrapeOccurrences(projectId, submissionId);

    expect(result).toEqual(undefined);
  });

  it('initiateOccurrenceSubmissionProcessing works as expected', async () => {
    mock.onPost('/webhook/process-occurrence-submission').reply(200);

    const result = await useN8NApi(axios).initiateOccurrenceSubmissionProcessing(projectId, submissionId, fileType);

    expect(result).toEqual(undefined);
  });
});
