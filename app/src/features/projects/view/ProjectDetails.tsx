import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';
import GeneralInformation from './components/GeneralInformation';
import ProjectObjectives from './components/ProjectObjectives';
import TeamMembers from './components/TeamMember';
import Stack from '@mui/material/Stack';
import grey from '@mui/material/colors/grey';

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails = () => {
  const projectContext = useContext(ProjectContext);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  return (
    <>
      <Toolbar>
        <Typography variant="h4" component="h2">
          Project Details
        </Typography>
      </Toolbar>
      <Divider></Divider>
      <Stack
        p={3}
        divider={<Divider />}
        sx={{
          '& h3': {
            mb: 2,
            flex: '0 0 auto',
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          },
          '& h4': {
            width: { xs: '100%', md: '300px' },
            flex: '0 0 auto',
            color: 'text.secondary'
          },
          '& dl': {
            flex: '1 1 auto',
            m: 0
          },
          '& dt': {
            flex: '0 0 auto',
            width: { xs: '100%', md: '100px' },
            typography: { xs: 'body2', md: 'body1' },
            color: 'text.secondary'
          },
          '& dd': {
            typography: 'body1',
            color: 'text.primary'
          },
          '& .row': {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: { xs: 0, md: '24px' },
            mt: 0,
            py: 1,
            borderTop: '1px solid ' + grey[200]
          },
          '& hr': {
            my: 3
          }
        }}>
        <Box component="section">
          <Typography component="h3"
            sx={{
              pb: 2,
              borderBottom: '1px solid ' + grey[200]
            }}
          >
            Project Objectives
          </Typography>
          <ProjectObjectives />
        </Box>

        <Box component="section">
          <Typography component="h3">
            General Information
          </Typography>
          <GeneralInformation />
        </Box>

        <Box component="section">
          <Typography component="h3">
            Team Members
          </Typography>
          <TeamMembers />
        </Box>
      </Stack>
    </>
  );
};

export default ProjectDetails;
