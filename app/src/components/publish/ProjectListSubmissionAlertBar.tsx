import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';

export interface IProjectsSubmissionAlertBarProps {
  projects: IGetProjectsListResponse[];
}

const ProjectListSubmissionAlertBar: React.FC<IProjectsSubmissionAlertBarProps> = (props) => {
  const { projects } = props;
  const [forceAlertClose, setForceAlertClose] = useState(false);

  if (forceAlertClose) {
    // User has manually closed the banner
    return <></>;
  }

  const submissionStatuses: ('NO_DATA' | 'SUBMITTED' | 'UNSUBMITTED')[] = [getProjectsDataSubmissionStatus(projects)];

  const hasData = submissionStatuses.some((status) => status !== 'NO_DATA');

  if (!hasData) {
    // Project has no data (neither submitted nor unsubmitted), don't show the banner
    return <></>;
  }

  const hasUnsubmittedData = submissionStatuses.some((status) => status === 'UNSUBMITTED');

  const alertSeverity = hasUnsubmittedData ? 'error' : 'success';
  const alertTitle = hasUnsubmittedData
    ? 'One or more projects contain unsubmitted information'
    : 'All projects information submitted';
  const alertText = hasUnsubmittedData
    ? 'Please ensure that any information that has been uploaded is promptly submitted for review.'
    : 'Thank you for submitting all project information to the BioHub Collector System.';

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

function getProjectsDataSubmissionStatus(projectsData?: IGetProjectsListResponse[]) {
  if (
    !projectsData?.length ||
    projectsData.every((item) => item.projectSupplementaryData.publishStatus === 'NO_DATA')
  ) {
    return 'NO_DATA';
  }

  if (projectsData.some((item) => item.projectSupplementaryData.publishStatus === 'UNSUBMITTED')) {
    return 'UNSUBMITTED';
  }

  return 'SUBMITTED';
}

export default ProjectListSubmissionAlertBar;
