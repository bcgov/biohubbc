import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';

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
      <Typography component="div">{projectData.coordinator.coordinator_agency}</Typography>
      <Typography component="div">
        <Link href={`mailto:${projectData.coordinator.email_address}`}>{projectData.coordinator.email_address}</Link>
      </Typography>
    </Box>
  );
};

export default ProjectCoordinator;
