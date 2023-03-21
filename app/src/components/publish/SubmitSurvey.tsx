import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IGetObservationSubmissionResponse, ISurveyObservationData } from 'interfaces/useObservationApi.interface';
import { IGetSummaryResultsResponse, ISurveySummaryData } from 'interfaces/useSummaryResultsApi.interface';
import {
  IGetSurveyAttachment,
  IGetSurveyForViewResponse,
  IGetSurveyReportAttachment
} from 'interfaces/useSurveyApi.interface';
import React from 'react';
import yup from 'utils/YupSchema';
import SelectAllButton from './SelectAllButton';
import SubmitSection from './SubmitSection';

export interface ISubmitSurvey {
  surveyDetails: IGetSurveyForViewResponse;
}

export interface ISurveySubmitForm {
  observations: IGetObservationSubmissionResponse[];
  summary: IGetSummaryResultsResponse[];
  reports: IGetSurveyReportAttachment[];
  attachments: IGetSurveyAttachment[];
}

export const SurveySubmitFormInitialValues: ISurveySubmitForm = {
  observations: [],
  summary: [],
  reports: [],
  attachments: []
};

export const SurveySubmitFormYupSchema = yup.object().shape({
  observations: yup.array(),
  summary: yup.array(),
  reports: yup.array(),
  attachments: yup.array()
});

const SubmitSurvey: React.FC<ISubmitSurvey> = (props) => {
  const biohubApi = useBiohubApi();

  const { surveyDetails } = props;

  const observationDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.observation.getObservationSubmission(projectId, surveyId)
  );
  useDataLoaderError(observationDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Occurrence Details',
      dialogText:
        'An error has occurred while attempting to load occurrence details, please try again. If the error persists, please contact your system administrator.'
    };
  });
  observationDataLoader.load(
    surveyDetails.surveyData.survey_details.project_id,
    surveyDetails.surveyData.survey_details.id
  );

  const summaryDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.survey.getSurveySummarySubmission(projectId, surveyId)
  );
  useDataLoaderError(summaryDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Summary Details',
      dialogText:
        'An error has occurred while attempting to load Summary details, please try again. If the error persists, please contact your system administrator.'
    };
  });
  summaryDataLoader.load(
    surveyDetails.surveyData.survey_details.project_id,
    surveyDetails.surveyData.survey_details.id
  );

  const attachmentAndReportDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.survey.getSurveyAttachments(projectId, surveyId)
  );
  useDataLoaderError(attachmentAndReportDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Reports and Attachments Details',
      dialogText:
        'An error has occurred while attempting to load Report/Attachment details, please try again. If the error persists, please contact your system administrator.'
    };
  });
  attachmentAndReportDataLoader.load(
    surveyDetails.surveyData.survey_details.project_id,
    surveyDetails.surveyData.survey_details.id
  );

  if (attachmentAndReportDataLoader.isLoading || observationDataLoader.isLoading || summaryDataLoader.isLoading) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Box mb={2}>
        <Typography variant="body1" color="textSecondary">
          <strong>Please Note:</strong> Submitted data cannot be modified. You will need to contact an administrator if
          you need to modify submitted information.
        </Typography>
      </Box>

      <SelectAllButton
        formikData={[
          { key: 'observations', value: observationDataLoader.data ? [observationDataLoader.data] : [] },
          { key: 'summary', value: summaryDataLoader.data ? [summaryDataLoader.data] : [] },
          {
            key: 'reports',
            value:
              attachmentAndReportDataLoader.data && attachmentAndReportDataLoader.data.reportAttachmentsList
                ? attachmentAndReportDataLoader.data.reportAttachmentsList
                : []
          },
          {
            key: 'attachments',
            value:
              attachmentAndReportDataLoader.data && attachmentAndReportDataLoader.data.attachmentsList
                ? attachmentAndReportDataLoader.data.attachmentsList
                : []
          }
        ]}
      />

      {observationDataLoader.isReady && (
        <SubmitSection
          subHeader="Observations"
          formikName="observations"
          data={
            observationDataLoader.data?.surveyObservationData ? [observationDataLoader.data.surveyObservationData] : []
          }
          getName={(item: ISurveyObservationData) => {
            return item.inputFileName;
          }}
        />
      )}

      {summaryDataLoader.isReady && (
        <SubmitSection
          subHeader="Summary Results"
          formikName="summary"
          data={summaryDataLoader.data?.surveySummaryData ? [summaryDataLoader.data.surveySummaryData] : []}
          getName={(item: ISurveySummaryData) => {
            return item.fileName;
          }}
        />
      )}

      {attachmentAndReportDataLoader.isReady && (
        <SubmitSection
          subHeader="Reports"
          formikName="reports"
          data={
            attachmentAndReportDataLoader.data && attachmentAndReportDataLoader.data.reportAttachmentsList
              ? attachmentAndReportDataLoader.data.reportAttachmentsList
              : []
          }
          getName={(item: IGetSurveyReportAttachment) => {
            return item.fileName;
          }}
        />
      )}

      {attachmentAndReportDataLoader.isReady && (
        <SubmitSection
          subHeader="Other Documents"
          formikName="attachments"
          data={
            attachmentAndReportDataLoader.data && attachmentAndReportDataLoader.data.attachmentsList
              ? attachmentAndReportDataLoader.data.attachmentsList
              : []
          }
          getName={(item: IGetSurveyAttachment) => {
            return item.fileName;
          }}
        />
      )}
    </>
  );
};

export default SubmitSurvey;
