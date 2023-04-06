import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import assert from 'assert';
import { ProjectContext } from 'contexts/projectContext';
import React, { useContext } from 'react';

/**
 * Project coordinator content for a project.
 *
 * @return {*}
 */
const ProjectCoordinator = () => {
  const projectContext = useContext(ProjectContext);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const projectData = projectContext.projectDataLoader.data.projectData;

  return (
    <Box>
      <Typography component="div">
        {projectData.coordinator.first_name} {projectData.coordinator.last_name}
      </Typography>
      <Typography component="div" color="textSecondary">
        {projectData.coordinator.coordinator_agency}
      </Typography>
      <Typography component="div">
        <Link href={'mailto:' + projectData.coordinator.email_address}>{projectData.coordinator.email_address}</Link>
      </Typography>
    </Box>
  );
};

export default ProjectCoordinator;
