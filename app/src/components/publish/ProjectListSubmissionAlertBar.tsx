import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
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

  const alertSeverity = hasUnsubmittedData ? 'info' : 'success';
  const alertTitle = hasUnsubmittedData
    ? 'One or more projects contain unsubmitted information'
    : 'All projects information submitted';
  const alertText = hasUnsubmittedData
    ? 'Please ensure that any information that has been uploaded is promptly submitted for review.'
    : 'Thank you for submitting all project information to the BioHub Collector System.';

  // Project has data, and some of it is unsubmitted, show the banner
  return (
    <Box mb={3}>
      <Alert variant="outlined" severity={alertSeverity} onClose={() => setForceAlertClose(true)}
      action={
        <IconButton color="primary" onClick={() => setForceAlertClose(true)}>
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
  if (!projectsData?.length) {
    return 'NO_DATA';
  }

  if (projectsData.every((item) => !item.projectSupplementaryData.has_unpublished_content)) {
    return 'SUBMITTED';
  }

  return 'UNSUBMITTED';
}

export default ProjectListSubmissionAlertBar;
