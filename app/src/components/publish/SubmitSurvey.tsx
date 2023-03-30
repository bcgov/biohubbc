import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IGetObservationSubmissionResponse, ISurveyObservationData } from 'interfaces/useObservationApi.interface';
import { IGetSummaryResultsResponse, ISurveySummaryData } from 'interfaces/useSummaryResultsApi.interface';
import { IGetSurveyAttachment, IGetSurveyReportAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React, useContext } from 'react';
import yup from 'utils/YupSchema';
import SelectAllButton from './SelectAllButton';
import SubmitSection from './SubmitSection';

export interface ISubmitSurvey {
  unSubmittedObservation: (data: IGetObservationSubmissionResponse) => ISurveyObservationData[];
  unSubmittedSummary: (data: IGetSummaryResultsResponse) => ISurveySummaryData[];
  unSumittedArtifacts: (
    data: IGetSurveyAttachment[] | IGetSurveyReportAttachment[]
  ) => IGetSurveyAttachment[] | IGetSurveyReportAttachment[];
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
  const { unSubmittedObservation, unSubmittedSummary, unSumittedArtifacts } = props;

  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const surveyDetails = surveyContext.surveyDataLoader.data;

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

  if (surveyDetails) {
    attachmentAndReportDataLoader.load(
      surveyDetails.surveyData.survey_details.project_id,
      surveyDetails.surveyData.survey_details.id
    );

    summaryDataLoader.load(
      surveyDetails.surveyData.survey_details.project_id,
      surveyDetails.surveyData.survey_details.id
    );

    observationDataLoader.load(
      surveyDetails.surveyData.survey_details.project_id,
      surveyDetails.surveyData.survey_details.id
    );
  }

  if (!attachmentAndReportDataLoader.data || !observationDataLoader.data || !summaryDataLoader.data) {
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
          {
            key: 'observations',
            value: unSubmittedObservation(observationDataLoader.data)
          },
          {
            key: 'summary',
            value: unSubmittedSummary(summaryDataLoader.data)
          },
          {
            key: 'reports',
            value: unSumittedArtifacts(attachmentAndReportDataLoader.data.reportAttachmentsList)
          },
          {
            key: 'attachments',
            value: unSumittedArtifacts(attachmentAndReportDataLoader.data.attachmentsList)
          }
        ]}
      />

      {unSubmittedObservation(observationDataLoader.data).length !== 0 && (
        <SubmitSection
          subHeader="Observations"
          formikName="observations"
          data={unSubmittedObservation(observationDataLoader.data)}
          getName={(item: ISurveyObservationData) => {
            return item.inputFileName;
          }}
        />
      )}

      {unSubmittedSummary(summaryDataLoader.data).length !== 0 && (
        <SubmitSection
          subHeader="Summary Results"
          formikName="summary"
          data={unSubmittedSummary(summaryDataLoader.data)}
          getName={(item: ISurveySummaryData) => {
            return item.fileName;
          }}
        />
      )}

      {unSumittedArtifacts(attachmentAndReportDataLoader.data.reportAttachmentsList).length !== 0 && (
        <SubmitSection
          subHeader="Reports"
          formikName="reports"
          data={unSumittedArtifacts(attachmentAndReportDataLoader.data.reportAttachmentsList)}
          getName={(item: IGetSurveyReportAttachment) => {
            return item.fileName;
          }}
        />
      )}

      {unSumittedArtifacts(attachmentAndReportDataLoader.data.attachmentsList).length !== 0 && (
        <SubmitSection
          subHeader="Other Documents"
          formikName="attachments"
          data={unSumittedArtifacts(attachmentAndReportDataLoader.data.attachmentsList)}
          getName={(item: IGetSurveyAttachment) => {
            return item.fileName;
          }}
        />
      )}
    </>
  );
};

export default SubmitSurvey;
