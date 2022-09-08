import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useObservationApi from './useObservationApi';

describe('useObservationApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;
  const surveyId = 2;

  it('getObservationSubmission works as expected', async () => {
    mock
      .onGet(`/api/project/${projectId}/survey/${surveyId}/observation/submission/get`)
      .reply(200, { id: 1, inputFileName: 'file.txt' });

    const result = await useObservationApi(axios).getObservationSubmission(projectId, surveyId);

    expect(result.id).toEqual(1);
    expect(result.inputFileName).toEqual('file.txt');
  });

  it('initiateScrapeOccurrences works as expected', async () => {
    const projectId = 1;
    const submissionId = 1;

    mock.onPost(`/api/dwc/scrape-occurrences`).reply(200, true);

    const result = await useObservationApi(axios).initiateScrapeOccurrences(projectId, submissionId);

    expect(result).toEqual(true);
  });

  it('deleteObservationSubmission works as expected', async () => {
    const submissionId = 1;

    mock
      .onDelete(`/api/project/${projectId}/survey/${surveyId}/observation/submission/${submissionId}/delete`)
      .reply(200, 1);

    const result = await useObservationApi(axios).deleteObservationSubmission(projectId, surveyId, submissionId);

    expect(result).toEqual(1);
  });

  it('uploadObservationSubmission works as expected with dwc', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'application/x-zip-compressed'
    });

    mock
      .onPost(`/api/project/${projectId}/survey/${surveyId}/observation/submission/upload`)
      .reply(200, { submissionId: 1 });
    mock.onPost('/api/dwc/validate').reply(200);

    const result = await useObservationApi(axios).uploadObservationSubmission(projectId, surveyId, file);

    expect(result.submissionId).toEqual(1);
  });

  it('uploadObservationSubmission works as expected with xlsx', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'xlsx'
    });

    mock
      .onPost(`/api/project/${projectId}/survey/${surveyId}/observation/submission/upload`)
      .reply(200, { submissionId: 1 });
    mock.onPost('/api/xlsx/validate').reply(200);

    const result = await useObservationApi(axios).uploadObservationSubmission(projectId, surveyId, file);

    expect(result.submissionId).toEqual(1);
  });

  it('uploadObservationSubmission works as expected when response has no submissionId', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'xlsx'
    });

    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observation/submission/upload`).reply(200, {});

    const result = await useObservationApi(axios).uploadObservationSubmission(projectId, surveyId, file);

    expect(result).toEqual({});
  });

  it('initiateXLSXSubmissionTransform works as expected', async () => {
    const projectId = 1;
    const submissionId = 2;
    mock.onPost(`/api/xlsx/transform`).reply(200, true);

    const result = await useObservationApi(axios).initiateXLSXSubmissionTransform(projectId, submissionId);

    expect(result).toEqual(true);
  });

  it('initiateXLSXSubmissionValidation works as expected', async () => {
    const projectId = 1;
    const submissionId = 2;
    mock.onPost(`/api/xlsx/validate`).reply(200, true);

    const result = await useObservationApi(axios).initiateXLSXSubmissionValidation(projectId, submissionId);

    expect(result).toEqual(true);
  });

  it('initiateDwCSubmissionValidation works as expected', async () => {
    const projectId = 1;
    const submissionId = 2;
    mock.onPost(`/api/dwc/validate`).reply(200, true);

    const result = await useObservationApi(axios).initiateDwCSubmissionValidation(projectId, submissionId);

    expect(result).toEqual(true);
  });

  it('getOccurrencesForView works as expected', async () => {
    const projectId = 1;
    const submissionId = 2;
    const data = {
      geometry: null,
      taxonId: 'taxon123',
      lifeStage: 'yearling',
      vernacularName: 'vname',
      individualCount: 23,
      organismQuantity: 23,
      organismQuantityType: 'Individual',
      occurrenceId: 2,
      eventDate: '2020/04/04'
    };

    mock.onPost(`/api/dwc/view-occurrences`).reply(200, data);

    const result = await useObservationApi(axios).getOccurrencesForView(projectId, submissionId);

    expect(result).toEqual(data);
  });
  it('processOccurrences works as expected', async () => {
    const projectId = 1;
    const submissionId = 2;
    mock.onPost(`/api/xlsx/process`).reply(200, true);

    const result = await useObservationApi(axios).processOccurrences(projectId, submissionId);

    expect(result).toEqual(true);
  });
});
