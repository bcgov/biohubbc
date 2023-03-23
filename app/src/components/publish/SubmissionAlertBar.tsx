import Alert, { AlertProps } from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IGetSurveyAttachmentsResponse, SurveySupplementaryData } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';

const SubmissionAlertBar: React.FC = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);
  const { projectId, surveyId, surveyDataLoader } = surveyContext;

  const surveyData = surveyDataLoader.data;

  const [alertOpen, setAlertOpen] = useState(false);
  const [forceAlertClose, setForceAlertClose] = useState(true);

  const artifactDataLoader = useDataLoader(() => biohubApi.survey.getSurveyAttachments(projectId, surveyId));
  useDataLoaderError(artifactDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Survey Artifact Details',
      dialogText:
        'An error has occurred while attempting to load artifact details, please try again. If the error persists, please contact your system administrator.'
    };
  });
  artifactDataLoader.load();
  const artifactData = artifactDataLoader.data;

  let submitted = false;

  const checkArtifactSubmissionStatus = (
    artifacts: IGetSurveyAttachmentsResponse | null | undefined
  ): BioHubSubmittedStatusType => {
    let artifactSubmitted = true;

    if (!artifacts) {
      return BioHubSubmittedStatusType.UNSUBMITTED;
    }

    if (artifacts.attachmentsList.length > 0) {
      artifacts.attachmentsList.forEach((element) => {
        if (!element.supplementaryAttachmentData || !element.supplementaryAttachmentData.event_timestamp) {
          artifactSubmitted = false;
          return;
        }
      });
    }
    return artifactSubmitted ? BioHubSubmittedStatusType.SUBMITTED : BioHubSubmittedStatusType.UNSUBMITTED;
  };

  const checkSubmissionStatus = (
    supplementaryData: SurveySupplementaryData | null | undefined
  ): BioHubSubmittedStatusType => {
    if (!supplementaryData) {
      return BioHubSubmittedStatusType.UNSUBMITTED;
    }

    if (
      checkOccurrenceExists(supplementaryData) &&
      !supplementaryData?.occurrence_submission_publish?.event_timestamp
    ) {
      return BioHubSubmittedStatusType.UNSUBMITTED;
    }

    if (
      checkSummaryExists(supplementaryData) &&
      !supplementaryData?.survey_summary_submission_publish?.event_timestamp
    ) {
      return BioHubSubmittedStatusType.UNSUBMITTED;
    }

    return BioHubSubmittedStatusType.SUBMITTED;
  };

  const checkOccurrenceExists = (supplementaryData: SurveySupplementaryData | null | undefined): boolean => {
    if (supplementaryData?.occurrence_submission.occurrence_submission_id !== null) {
      return true;
    }
    return false;
  };

  const checkSummaryExists = (supplementaryData: SurveySupplementaryData | null | undefined): boolean => {
    if (supplementaryData?.occurrence_submission.occurrence_submission_id !== null) {
      return true;
    }
    return false;
  };

  if (surveyData && artifactData) {
    if (
      checkOccurrenceExists(surveyData.surveySupplementaryData) ||
      checkSummaryExists(surveyData.surveySupplementaryData) ||
      artifactData.attachmentsList.length > 0 ||
      artifactData.reportAttachmentsList.length > 0
    ) {
      if (alertOpen === false) {
        setAlertOpen(true);
      }

      const surveySubmitted = checkSubmissionStatus(surveyData.surveySupplementaryData);
      const artifactSubmitted = checkArtifactSubmissionStatus(artifactDataLoader.data);
      submitted =
        artifactSubmitted === BioHubSubmittedStatusType.SUBMITTED &&
        surveySubmitted === BioHubSubmittedStatusType.SUBMITTED;
    }
  }

  const alertProps: AlertProps = {
    severity: submitted ? 'success' : 'info',
    onClose: () => setForceAlertClose(false)
  };

  return (
    <>
      {alertOpen && forceAlertClose && (
        <Alert {...alertProps}>
          <AlertTitle>
            {submitted ? 'All survey data submitted' : 'This survey contains unsubmitted information'}
          </AlertTitle>
          {submitted
            ? 'Thank you for submitting your data to the BioHub Collector System.'
            : 'Please ensure that any information uploaded to this survey is promptly submitted for review.'}
        </Alert>
      )}
    </>
  );
};

export default SubmissionAlertBar;
