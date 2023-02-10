import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectCoordinatorProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Project coordinator content for a project.
 *
 * @return {*}
 */
const ProjectCoordinator: React.FC<IProjectCoordinatorProps> = (props) => {
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
