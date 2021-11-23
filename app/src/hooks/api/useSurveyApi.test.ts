import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ICreateSurveyRequest, UPDATE_GET_SURVEY_ENTITIES } from 'interfaces/useSurveyApi.interface';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import useSurveyApi from './useSurveyApi';
import { AttachmentType } from '../../constants/attachments';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';

describe('useSurveyApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;
  const surveyId = 2;
  const attachmentId = 3;
  const attachmentType = 'type';
  const attachmentMeta: IReportMetaForm = {
    title: 'upload file',
    authors: [{ first_name: 'John', last_name: 'Smith' }],
    description: 'file abstract',
    year_published: 2000,
    attachmentFile: new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    })
  };

  const attachmentMetaForUpdate: IEditReportMetaForm = {
    title: 'upload file',
    authors: [{ first_name: 'John', last_name: 'Smith' }],
    description: 'file abstract',
    year_published: 2000,
    revision_count: 1
  };

  it('getObservationSubmissionSignedURL works as expected', async () => {
    const submissionId = 4;

    mock
      .onGet(`/api/project/${projectId}/survey/${surveyId}/observation/submission/${submissionId}/getSignedUrl`)
      .reply(200, 'www.signedurl.com');

    const result = await useSurveyApi(axios).getObservationSubmissionSignedURL(projectId, surveyId, submissionId);

    expect(result).toEqual('www.signedurl.com');
  });

  it('getSurveyPermits works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/survey/permits/list`).reply(200, [
      {
        number: '123',
        type: 'wildlife'
      }
    ]);

    const result = await useSurveyApi(axios).getSurveyPermits(projectId);

    expect(result[0].number).toEqual('123');
    expect(result[0].type).toEqual('wildlife');
  });

  it('getSurveyFundingSources works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/survey/funding-sources/list`).reply(200, [
      {
        pfsId: 1,
        amount: 100,
        startDate: '2020/04/04',
        endDate: '2020/05/05',
        agencyName: 'agency'
      }
    ]);

    const result = await useSurveyApi(axios).getSurveyFundingSources(projectId);

    expect(result[0].pfsId).toEqual(1);
  });

  it('createSurvey works as expected', async () => {
    mock.onPost(`api/project/${projectId}/survey/create`).reply(200, {
      id: 1
    });

    const result = await useSurveyApi(axios).createSurvey(projectId, {
      survey_name: 'survey name'
    } as ICreateSurveyRequest);

    expect(result).toEqual({ id: 1 });
  });

  it('deleteSurvey works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/survey/${surveyId}/delete`).reply(200, true);

    const result = await useSurveyApi(axios).deleteSurvey(projectId, surveyId);

    expect(result).toEqual(true);
  });

  it('deleteSurveyAttachment works as expected', async () => {
    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/delete`).reply(200, 1);

    const result = await useSurveyApi(axios).deleteSurveyAttachment(
      projectId,
      surveyId,
      attachmentId,
      attachmentType,
      'token'
    );

    expect(result).toEqual(1);
  });

  it('getSurveyForView works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/survey/${surveyId}/view`).reply(200, getSurveyForViewResponse);

    const result = await useSurveyApi(axios).getSurveyForView(projectId, surveyId);

    expect(result.survey_details.id).toEqual(1);
    expect(result.survey_details.survey_name).toEqual('survey name');
  });

  it('getSurveysList works as expected', async () => {
    const res = [
      {
        id: 1,
        name: 'name',
        species: ['species 1', 'species 2'],
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        publish_status: 'Published',
        completion_status: 'Completed'
      }
    ];

    mock.onGet(`/api/project/${projectId}/surveys`).reply(200, res);

    const result = await useSurveyApi(axios).getSurveysList(projectId);

    expect(result[0].id).toEqual(1);
  });

  it('getSurveyAttachmentSignedURL works as expected', async () => {
    const signedUrl = 'url.com';

    mock
      .onGet(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/getSignedUrl`, {
        query: { attachmentType: AttachmentType.REPORT }
      })
      .reply(200, signedUrl);

    const result = await useSurveyApi(axios).getSurveyAttachmentSignedURL(
      projectId,
      surveyId,
      attachmentId,
      AttachmentType.REPORT
    );

    expect(result).toEqual(signedUrl);
  });

  it('getSurveyAttachments works as expected', async () => {
    const res = {
      attachmentsList: [
        {
          id: 1,
          fileName: 'name',
          lastModified: '2020/05/05',
          size: 3028
        }
      ]
    };

    mock.onGet(`/api/project/${projectId}/survey/${surveyId}/attachments/list`).reply(200, res);

    const result = await useSurveyApi(axios).getSurveyAttachments(projectId, surveyId);

    expect(result.attachmentsList[0].id).toEqual(1);
  });

  it('uploadSurveyAttachments works as expected', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    });

    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/attachments/upload`).reply(200, 'result 1');

    const result = await useSurveyApi(axios).uploadSurveyAttachments(
      projectId,
      surveyId,
      file,
      attachmentType,
      attachmentMeta
    );

    expect(result).toEqual('result 1');
  });

  it('uploadSurveySummaryResults works as expected', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    });

    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/summary/submission/upload`).reply(200, 'result 1');

    const result = await useSurveyApi(axios).uploadSurveySummaryResults(projectId, surveyId, file);

    expect(result).toEqual('result 1');
  });

  it('updateSurvey works as expected', async () => {
    const request = {
      survey_details: {
        id: 1,
        survey_name: 'name',
        survey_purpose: 'purpose',
        focal_species: [1, 2],
        ancillary_species: [1, 2],
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        geometry: [],
        revision_count: 1,
        permit_number: '123',
        permit_type: 'Scientific'
      },
      survey_proprietor: null
    };

    mock.onPut(`api/project/${projectId}/survey/${surveyId}/update`).reply(200, true);

    const result = await useSurveyApi(axios).updateSurvey(projectId, surveyId, request as any);

    expect(result).toEqual(true);
  });

  it('getSurveySummarySubmission works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/survey/${surveyId}/summary/submission/get`).reply(200, {
      id: 1,
      fileName: 'name'
    });

    const result = await useSurveyApi(axios).getSurveySummarySubmission(projectId, surveyId);

    expect(result).toEqual({
      id: 1,
      fileName: 'name'
    });
  });

  it('getSubmissionCSVForView works as expected', async () => {
    const summaryId = 2;
    const resultData = {
      data: {
        name: 'name',
        headers: [],
        rows: [[]]
      }
    };

    mock
      .onGet(`/api/project/${projectId}/survey/${surveyId}/summary/submission/${summaryId}/view`)
      .reply(200, resultData);

    const result = await useSurveyApi(axios).getSubmissionCSVForView(projectId, surveyId, summaryId);

    expect(result).toEqual(resultData);
  });

  it('getSurveyForUpdate works as expected', async () => {
    const data = {
      survey_details: {
        id: 1,
        survey_name: 'name',
        survey_purpose: 'purpose',
        focal_species: [1, 2],
        ancillary_species: [1, 2],
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        geometry: [],
        revision_count: 1
      },
      survey_proprietor: null
    };

    mock.onGet(`api/project/${projectId}/survey/${surveyId}/update`).reply(200, data);

    const result = await useSurveyApi(axios).getSurveyForUpdate(projectId, surveyId, [
      UPDATE_GET_SURVEY_ENTITIES.survey_details
    ]);

    expect(result).toEqual(data);
  });

  // it('publishSurvey works as expected', async () => {
  //   mock.onPut(`/api/project/${projectId}/survey/${surveyId}/publish`).reply(200, 'OK');

  //   const result = await useSurveyApi(axios).publishSurvey(projectId, surveyId, true);

  //   expect(result).toEqual('OK');
  // });

  it('deleteSummarySubmission works as expected', async () => {
    const summaryId = 2;

    mock.onDelete(`/api/project/${projectId}/survey/${surveyId}/summary/submission/${summaryId}/delete`).reply(200, 1);

    const result = await useSurveyApi(axios).deleteSummarySubmission(projectId, surveyId, summaryId);

    expect(result).toEqual(1);
  });

  it('getSummarySubmissionSignedURL works as expected', async () => {
    const summaryId = 2;

    mock
      .onGet(`/api/project/${projectId}/survey/${surveyId}/summary/submission/${summaryId}/getSignedUrl`)
      .reply(200, 'url.com');

    const result = await useSurveyApi(axios).getSummarySubmissionSignedURL(projectId, surveyId, summaryId);

    expect(result).toEqual('url.com');
  });

  it('makeAttachmentUnsecure works as expected', async () => {
    mock
      .onPut(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/makeUnsecure`)
      .reply(200, true);

    const result = await useSurveyApi(axios).makeAttachmentUnsecure(
      projectId,
      surveyId,
      attachmentId,
      'token',
      'Image'
    );

    expect(result).toEqual(true);
  });

  it('makeAttachmentSecure works as expected', async () => {
    mock.onPut(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/makeSecure`).reply(200, true);

    const result = await useSurveyApi(axios).makeAttachmentSecure(projectId, surveyId, attachmentId, 'Image');

    expect(result).toEqual(true);
  });

  it('updateSurveyAttachmentMetadata works as expected', async () => {
    mock
      .onPut(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/metadata/update`)
      .reply(200, 'result 1');

    const result = await useSurveyApi(axios).updateSurveyAttachmentMetadata(
      projectId,
      surveyId,
      attachmentId,
      attachmentType,
      attachmentMetaForUpdate,
      attachmentMetaForUpdate.revision_count
    );

    expect(result).toEqual('result 1');
  });

  it('getSurveyReportMetadata works as expected', async () => {
    mock
      .onGet(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/metadata/get`)
      .reply(200, 'result 1');

    const result = await useSurveyApi(axios).getSurveyReportMetadata(projectId, surveyId, attachmentId);

    expect(result).toEqual('result 1');
  });
});
