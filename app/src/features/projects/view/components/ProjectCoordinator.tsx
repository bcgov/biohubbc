import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { ProjectViewObject } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectCoordinatorProps {
  projectForViewData: ProjectViewObject;
}

/**
 * Project coordinator content for a project.
 *
 * @param {IProjectCoordinatorProps} props
 * @return {*}
 */
const ProjectCoordinator = (props: IProjectCoordinatorProps) => {
  const {
    projectForViewData: { coordinator }
  } = props;

  return (
    <Box>
      <Typography component="div">
        {coordinator.first_name} {coordinator.last_name}
      </Typography>
      <Typography component="div" color="textSecondary">
        {coordinator.coordinator_agency}
      </Typography>
      <Typography component="div">
        <Link href={'mailto:' + coordinator.email_address}>{coordinator.email_address}</Link>
      </Typography>
    </Box>
  );
};

export default ProjectCoordinator;
