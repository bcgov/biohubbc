import { Button } from '@material-ui/core';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import PublishSurveySections, {
  ISurveySubmitForm,
  SurveySubmitFormInitialValues,
  SurveySubmitFormYupSchema
} from 'components/publish/PublishSurveySections';
import { SUBMISSION_STATUS_TYPE } from 'constants/submissions';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetObservationSubmissionResponse, ISurveyObservationData } from 'interfaces/useObservationApi.interface';
import { IGetSummaryResultsResponse, ISurveySummaryData } from 'interfaces/useSummaryResultsApi.interface';
import {
  IGetSurveyAttachment,
  IGetSurveyAttachmentsResponse,
  IGetSurveyReportAttachment
} from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';
import PublishDialogs from './PublishDialogs';

/**
 * Survey Publish button.
 *
 * @return {*}
 */
const PublishSurveyButton: React.FC = (props) => {
  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);

  const surveyDataLoader = surveyContext.surveyDataLoader;
  const observationDataLoader = surveyContext.observationDataLoader;
  const artifactDataLoader = surveyContext.artifactDataLoader;
  const summaryDataLoader = surveyContext.summaryDataLoader;

  const [finishSubmission, setFinishSubmission] = useState(false);
  const [noSubmissionData, setNoSubmissionData] = useState(false);
  const [openSubmitSurveyDialog, setOpenSubmitSurveyDialog] = useState(false);

  const refreshContext = (values: ISurveySubmitForm) => {
    // we only want the data loaders with changes to refresh
    if (values.observations.length > 0) {
      surveyContext.observationDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    if (values.summary.length > 0) {
      surveyContext.summaryDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    if (values.attachments.length > 0 || values.reports.length > 0) {
      surveyContext.artifactDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    surveyContext.surveyDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  };

  const checkUnsubmittedData = () => {
    const observation: ISurveyObservationData[] = unSubmittedObservation(observationDataLoader.data);
    const summary: ISurveySummaryData[] = unSubmittedSummary(summaryDataLoader.data);
    const reports: IGetSurveyReportAttachment[] = unSubmittedReports(artifactDataLoader.data);
    const attachments: IGetSurveyAttachment[] = unSubmittedAttachments(artifactDataLoader.data);

    if (observation.length === 0 && summary.length === 0 && reports.length === 0 && attachments.length === 0) {
      setNoSubmissionData(true);
      return;
    }
    setOpenSubmitSurveyDialog(true);
  };

  return (
    <>
      <Button
        title="Submit Survey Data and Documents"
        color="primary"
        variant="contained"
        onClick={() => checkUnsubmittedData()}
        style={{ minWidth: '8rem' }}>
        <strong>Submit</strong>
      </Button>

      <PublishDialogs
        finishSubmissionMessage="Thank you for submitting your survey data to Biohub."
        finishSubmissionTitle="Survey data submitted"
        finishSubmission={finishSubmission}
        setFinishSubmission={setFinishSubmission}
        noSubmissionTitle="No survey data to submit"
        noSubmissionMessage="No new data or information has been added to this survey to submit."
        noSubmissionData={noSubmissionData}
        setNoSubmissionData={setNoSubmissionData}
      />

      <SubmitBiohubDialog
        dialogTitle="Submit Survey Information"
        open={openSubmitSurveyDialog}
        onClose={() => setOpenSubmitSurveyDialog(!openSubmitSurveyDialog)}
        onSubmit={async (values: ISurveySubmitForm) => {
          if (surveyDataLoader.data) {
            await biohubApi.publish.publishSurvey(
              surveyContext.projectId,
              surveyDataLoader.data.surveyData.survey_details.id,
              values
            );
          }
          refreshContext(values);
          setFinishSubmission(true);
        }}
        formikProps={{
          initialValues: SurveySubmitFormInitialValues,
          validationSchema: SurveySubmitFormYupSchema
        }}>
        <PublishSurveySections
          unSubmittedObservation={unSubmittedObservation(observationDataLoader.data)}
          unSubmittedSummary={unSubmittedSummary(summaryDataLoader.data)}
          unSubmittedReports={unSubmittedReports(artifactDataLoader.data)}
          unSubmittedAttachments={unSubmittedAttachments(artifactDataLoader.data)}
        />
      </SubmitBiohubDialog>
    </>
  );
};

export default PublishSurveyButton;

export const unSubmittedObservation = (
  data: IGetObservationSubmissionResponse | undefined
): ISurveyObservationData[] => {
  if (
    data &&
    data.surveyObservationData &&
    !data.surveyObservationSupplementaryData?.occurrence_submission_id &&
    data.surveyObservationData.status === SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED
  ) {
    return [data.surveyObservationData];
  }
  return [];
};

const unSubmittedSummary = (data: IGetSummaryResultsResponse | undefined): ISurveySummaryData[] => {
  if (
    data &&
    data.surveySummaryData &&
    !data.surveySummarySupplementaryData?.survey_summary_submission_id &&
    data.surveySummaryData.messages.length === 0
  ) {
    return [data.surveySummaryData];
  }
  return [];
};

const unSubmittedReports = (data: IGetSurveyAttachmentsResponse | undefined): IGetSurveyReportAttachment[] => {
  return data
    ? data.reportAttachmentsList.filter((item) => !item.supplementaryAttachmentData?.artifact_revision_id)
    : [];
};

const unSubmittedAttachments = (data: IGetSurveyAttachmentsResponse | undefined): IGetSurveyAttachment[] => {
  return data ? data.attachmentsList.filter((item) => !item.supplementaryAttachmentData?.artifact_revision_id) : [];
};
