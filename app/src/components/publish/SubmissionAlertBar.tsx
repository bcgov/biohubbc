import Box from '@material-ui/core/Box';
import Alert, { AlertProps } from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { SurveyContext } from 'contexts/surveyContext';
import {
  IGetSurveyAttachment,
  IGetSurveyReportAttachment,
  SurveySupplementaryData
} from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';

const SubmissionAlertBar: React.FC = () => {
  const surveyContext = useContext(SurveyContext);
  const { surveyDataLoader, artifactDataLoader } = surveyContext;

  const surveyData = surveyDataLoader.data;
  const artifactData = artifactDataLoader.data;

  const [alertOpen, setAlertOpen] = useState(false);
  const [forceAlertClose, setForceAlertClose] = useState(true);

  if (!surveyData || !artifactData) {
    return <></>;
  }

  if (
    !getOccurrenceExists(surveyData.surveySupplementaryData) &&
    !getSummaryExists(surveyData.surveySupplementaryData) &&
    !getArtifactAttachmentsExists(artifactData.attachmentsList) &&
    !getArtifactAttachmentsExists(artifactData.reportAttachmentsList)
  ) {
    return <></>;
  }

  if (alertOpen === false) {
    setAlertOpen(true);
  }

  const surveyOccurrenceSubmissionStatus = getOccurrenceSubmissionStatus(surveyData.surveySupplementaryData);
  const surveySummarySubmissionStatus = getSummarySubmissionStatus(surveyData.surveySupplementaryData);
  const attachmentsListSubmissionStatus = getArtifactsSubmissionStatus(artifactData.attachmentsList);
  const reportAttachmentsListSubmissionStatus = getArtifactsSubmissionStatus(artifactData.reportAttachmentsList);

  const submitted =
    surveyOccurrenceSubmissionStatus === BioHubSubmittedStatusType.SUBMITTED &&
    surveySummarySubmissionStatus === BioHubSubmittedStatusType.SUBMITTED &&
    attachmentsListSubmissionStatus === BioHubSubmittedStatusType.SUBMITTED &&
    reportAttachmentsListSubmissionStatus === BioHubSubmittedStatusType.SUBMITTED;

  const alertProps: AlertProps = {
    severity: submitted ? 'success' : 'info',
    onClose: () => setForceAlertClose(false)
  };

  return (
    <>
      {alertOpen && forceAlertClose && (
        <Box mb={3}>
          <Alert {...alertProps}>
            <AlertTitle>
              {submitted ? 'All survey data submitted' : 'This survey contains unsubmitted information'}
            </AlertTitle>
            {submitted
              ? 'Thank you for submitting your data to the BioHub Collector System.'
              : 'Please ensure that any information uploaded to this survey is promptly submitted for review.'}
          </Alert>
        </Box>
      )}
    </>
  );
};

const getArtifactsSubmissionStatus = (
  artifacts: (IGetSurveyAttachment | IGetSurveyReportAttachment)[]
): BioHubSubmittedStatusType => {
  let artifactSubmitted = true;

  if (artifacts.length > 0) {
    artifacts.forEach((element) => {
      if (!element.supplementaryAttachmentData || !element.supplementaryAttachmentData.event_timestamp) {
        artifactSubmitted = false;
      }
    });
  }
  return artifactSubmitted ? BioHubSubmittedStatusType.SUBMITTED : BioHubSubmittedStatusType.UNSUBMITTED;
};

const getArtifactAttachmentsExists = (artifacts: (IGetSurveyAttachment | IGetSurveyReportAttachment)[]): boolean => {
  if (artifacts.length > 0) {
    return true;
  }
  return false;
};

const getOccurrenceSubmissionStatus = (supplementaryData: SurveySupplementaryData): BioHubSubmittedStatusType => {
  if (getOccurrenceExists(supplementaryData) && supplementaryData.occurrence_submission_publish === null) {
    return BioHubSubmittedStatusType.UNSUBMITTED;
  }

  return BioHubSubmittedStatusType.SUBMITTED;
};

const getSummarySubmissionStatus = (supplementaryData: SurveySupplementaryData): BioHubSubmittedStatusType => {
  if (getSummaryExists(supplementaryData) && supplementaryData.survey_summary_submission_publish === null) {
    return BioHubSubmittedStatusType.UNSUBMITTED;
  }

  return BioHubSubmittedStatusType.SUBMITTED;
};

const getOccurrenceExists = (supplementaryData: SurveySupplementaryData | null | undefined): boolean => {
  if (supplementaryData?.occurrence_submission.occurrence_submission_id !== null) {
    return true;
  }
  return false;
};

const getSummaryExists = (supplementaryData: SurveySupplementaryData | null | undefined): boolean => {
  if (supplementaryData?.survey_summary_submission.survey_summary_submission_id !== null) {
    return true;
  }
  return false;
};

export default SubmissionAlertBar;
