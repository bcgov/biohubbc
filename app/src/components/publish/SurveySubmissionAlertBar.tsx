import { mdiClose, mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { SurveyContext } from 'contexts/surveyContext';
import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import { IGetSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import { IGetSurveyAttachmentsResponse } from 'interfaces/useSurveyApi.interface';
import { useContext, useState } from 'react';

const SurveySubmissionAlertBar = () => {
  const surveyContext = useContext(SurveyContext);

  const [forceAlertClose, setForceAlertClose] = useState(false);

  if (forceAlertClose) {
    // User has manually closed the banner
    return <></>;
  }

  const observationData = surveyContext.observationDataLoader.data;
  const summaryData = surveyContext.summaryDataLoader.data;
  const attachmentData = surveyContext.artifactDataLoader.data;

  const submissionStatuses: ('NO_DATA' | 'SUBMITTED' | 'UNSUBMITTED')[] = [
    getOccurrenceDataSubmissionStatus(observationData),
    getSummaryDataSubmissionStatus(summaryData),
    getAttachmentDataSubmissionStatus(attachmentData)
  ];

  const hasData = submissionStatuses.some((status) => status !== 'NO_DATA');

  if (!hasData) {
    // Survey has no data (neither submitted nor unsubmitted), don't show the banner
    return <></>;
  }

  const hasUnsubmittedData = submissionStatuses.some((status) => status === 'UNSUBMITTED');

  const alertSeverity = hasUnsubmittedData ? 'error' : 'success';
  const alertTitle = hasUnsubmittedData
    ? 'This survey contains unsubmitted information'
    : 'All survey information submitted';
  const alertText = hasUnsubmittedData
    ? 'Please ensure that any information uploaded to this survey is promptly submitted for security review.'
    : 'All information for this survey has been submitted for security review by an administrator.';

  // Survey has data, and some of it is unsubmitted, show the banner
  return (
    <Box mb={3}>
      <Alert
        variant="filled"
        severity={alertSeverity}
        icon={<Icon path={mdiInformationOutline} size={1} />}
        onClose={() => setForceAlertClose(true)}
        action={
          <IconButton color="inherit" onClick={() => setForceAlertClose(true)}>
            <Icon path={mdiClose} size={1} />
          </IconButton>
        }>
        <AlertTitle>{alertTitle}</AlertTitle>
        {alertText}
      </Alert>
    </Box>
  );
};

function getOccurrenceDataSubmissionStatus(observationData?: IGetObservationSubmissionResponse) {
  if (!observationData?.surveyObservationData) {
    return 'NO_DATA';
  }

  if (observationData.surveyObservationSupplementaryData?.occurrence_submission_publish_id) {
    return 'SUBMITTED';
  }

  return 'UNSUBMITTED';
}

function getSummaryDataSubmissionStatus(summaryData?: IGetSummaryResultsResponse) {
  if (!summaryData?.surveySummaryData) {
    return 'NO_DATA';
  }

  if (summaryData.surveySummarySupplementaryData?.survey_summary_submission_publish_id) {
    return 'SUBMITTED';
  }

  return 'UNSUBMITTED';
}

function getAttachmentDataSubmissionStatus(surveyAttachmentsData?: IGetSurveyAttachmentsResponse) {
  if (!surveyAttachmentsData?.attachmentsList.length && !surveyAttachmentsData?.reportAttachmentsList.length) {
    return 'NO_DATA';
  }

  if (
    surveyAttachmentsData.reportAttachmentsList.every((item) => item.supplementaryAttachmentData?.event_timestamp) &&
    surveyAttachmentsData.attachmentsList.every((item) => item.supplementaryAttachmentData?.event_timestamp)
  ) {
    return 'SUBMITTED';
  }

  return 'UNSUBMITTED';
}

export default SurveySubmissionAlertBar;
