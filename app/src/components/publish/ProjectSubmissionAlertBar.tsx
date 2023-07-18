import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { ProjectContext } from 'contexts/projectContext';
import { IGetProjectAttachmentsResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForListResponse } from 'interfaces/useSurveyApi.interface';
import { useContext, useState } from 'react';

const ProjectSubmissionAlertBar = () => {
  const projectContext = useContext(ProjectContext);

  const [forceAlertClose, setForceAlertClose] = useState(false);

  if (forceAlertClose) {
    // User has manually closed the banner
    return <></>;
  }

  const surveyData = projectContext.surveysListDataLoader.data;
  const attachmentData = projectContext.artifactDataLoader.data;

  const submissionStatuses: ('NO_DATA' | 'SUBMITTED' | 'UNSUBMITTED')[] = [
    getAttachmentDataSubmissionStatus(attachmentData),
    getSurveyDataSubmissionStatus(surveyData)
  ];

  const hasData = submissionStatuses.some((status) => status !== 'NO_DATA');

  if (!hasData) {
    // Project has no data (neither submitted nor unsubmitted), don't show the banner
    return <></>;
  }

  const hasUnsubmittedData = submissionStatuses.some((status) => status === 'UNSUBMITTED');

  const alertSeverity = hasUnsubmittedData ? 'error' : 'success';
  const alertTitle = hasUnsubmittedData
    ? 'This project contains unsubmitted information'
    : 'All project information submitted';
  const alertText = hasUnsubmittedData
    ? 'Please ensure that any information uploaded to this project is promptly submitted for review.'
    : 'Thank you for submitting your project information to the BioHub Collector System.';

  // Project has data, and some of it is unsubmitted, show the banner
  return (
    <Box mb={3}>
      <Alert
        variant="filled"
        severity={alertSeverity}
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

function getSurveyDataSubmissionStatus(surveyData?: IGetSurveyForListResponse[]) {
  if (!surveyData?.length || surveyData.every((item) => item.surveySupplementaryData.publishStatus === 'NO_DATA')) {
    return 'NO_DATA';
  }

  if (surveyData.some((item) => item.surveySupplementaryData?.publishStatus === 'UNSUBMITTED')) {
    return 'UNSUBMITTED';
  }

  return 'SUBMITTED';
}

function getAttachmentDataSubmissionStatus(projectAttachmentsData?: IGetProjectAttachmentsResponse) {
  if (!projectAttachmentsData?.attachmentsList.length && !projectAttachmentsData?.reportAttachmentsList.length) {
    return 'NO_DATA';
  }

  if (
    projectAttachmentsData.reportAttachmentsList.every((item) => item.supplementaryAttachmentData?.event_timestamp) &&
    projectAttachmentsData.attachmentsList.every((item) => item.supplementaryAttachmentData?.event_timestamp)
  ) {
    return 'SUBMITTED';
  }

  return 'UNSUBMITTED';
}

export default ProjectSubmissionAlertBar;
