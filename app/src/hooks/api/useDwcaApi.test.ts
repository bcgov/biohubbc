import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useDwcaApi from './useDwcaApi';

describe('useDwcaApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;
  const surveyId = 2;

  it('deleteObservationSubmission works as expected', async () => {
    const submissionId = 1;

    mock
      .onDelete(`/api/project/${projectId}/survey/${surveyId}/dwca/observations/submission/${submissionId}/delete`)
      .reply(200, 1);

    const result = await useDwcaApi(axios).deleteObservationSubmission(projectId, surveyId, submissionId);

    expect(result).toEqual(1);
  });

  it('uploadObservationSubmission works as expected with dwc', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'application/x-zip-compressed'
    });

    mock
      .onPost(`/api/project/${projectId}/survey/${surveyId}/dwca/observations/submission/upload`)
      .reply(200, { submissionId: 1 });
    mock.onPost('/api/dwc/validate').reply(200);

    const result = await useDwcaApi(axios).uploadObservationSubmission(projectId, surveyId, file);

    expect(result.submissionId).toEqual(1);
  });

  it('uploadObservationSubmission works as expected with xlsx', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'xlsx'
    });

    mock
      .onPost(`/api/project/${projectId}/survey/${surveyId}/dwca/observations/submission/upload`)
      .reply(200, { submissionId: 1 });
    mock.onPost('/api/xlsx/validate').reply(200);

    const result = await useDwcaApi(axios).uploadObservationSubmission(projectId, surveyId, file);

    expect(result.submissionId).toEqual(1);
  });

  it('uploadObservationSubmission works as expected when response has no submissionId', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'xlsx'
    });

    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/dwca/observations/submission/upload`).reply(200, {});

    const result = await useDwcaApi(axios).uploadObservationSubmission(projectId, surveyId, file);

    expect(result).toEqual({});
  });

  it('initiateXLSXSubmissionTransform works as expected', async () => {
    const projectId = 1;
    const submissionId = 2;
    const surveyId = 3;
    mock.onPost(`/api/xlsx/transform`).reply(200, true);

    const result = await useDwcaApi(axios).initiateXLSXSubmissionTransform(projectId, submissionId, surveyId);

    expect(result).toEqual(true);
  });

  it('getOccurrencesForView works as expected', async () => {
    const project_id = 1;
    const observation_submission_id = 1;
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

    const result = await useDwcaApi(axios).getOccurrencesForView(project_id, observation_submission_id);

    expect(result).toEqual(data);
  });

  it('processOccurrences works as expected', async () => {
    const projectId = 1;
    const submissionId = 2;
    const surveyId = 3;

    mock.onPost(`/api/xlsx/process`).reply(200, true);

    const result = await useDwcaApi(axios).processOccurrences(projectId, submissionId, surveyId);

    expect(result).toEqual(true);
  });

  it('processDWCFile works as expected', async () => {
    const projectId = 1;
    const submissionId = 2;

    mock.onPost(`api/dwc/process`).reply(200, true);

    const result = await useDwcaApi(axios).processDWCFile(projectId, submissionId);

    expect(result).toEqual(true);
  });
});
