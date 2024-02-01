import { mdiCrown } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';

export interface IProjectParticipantsRoles {
  display_name: string;
  roles: string[];
  first_initial: string;
  second_initial: string;
}

/**
 * Project objectives content for a project.
 *
 * @return {*}
 */
const ProjectTeamMembers = () => {
  const projectContext = useContext(ProjectContext);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const projectData = projectContext.projectDataLoader.data.projectData;

  // Define a custom sorting order for roles
  const roleOrder: { [key: string]: number } = {
    Coordinator: 1,
    Collaborator: 2,
    Observer: 3
  };

  const projectTeamMembers: IProjectParticipantsRoles[] = projectData.participants
    .map((member) => {
      return {
        display_name: member.display_name,
        roles: member.project_role_names,
        first_initial: member.display_name.split(',')[1][1],
        second_initial: member.display_name.split(',')[0][0]
      };
    })
    .sort((a, b) => {
      const roleA = a.roles[0] || '';
      const roleB = b.roles[0] || '';
      return roleOrder[roleA] - roleOrder[roleB];
    });

  function getRandomHexColor(): string {
    // Generate a random color component and convert it to a two-digit hex value
    const randomComponent = () =>
      Math.floor(Math.random() * 130 + 120)
        .toString(16)
        .padStart(2, '0');

    // Concatenate three random color components to form a hex color
    const randomColor = `#${randomComponent()}${randomComponent()}${randomComponent()}`;

    return randomColor;
  }

  return (
    <Box component="dl" my={0}>
      <Stack spacing={1}>
        {projectTeamMembers.map((member) => (
          <Grid
            container
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            spacing={0}
            key={member.display_name}>
            <Grid item sm={8} display="flex" alignItems="center">
              <Box
                width="1.75rem"
                height="1.75rem"
                bgcolor={getRandomHexColor()}
                borderRadius="50%"
                mr={1}
                display="flex"
                alignItems="center"
                justifyContent="center">
                <Typography color="#fff" fontWeight="bold" fontSize="0.7rem">
                  {member.first_initial}
                  {member.second_initial}
                </Typography>
              </Box>
              <Typography component="dd">{member.display_name}</Typography>
            </Grid>
            <Grid item sm={4}>
              <Typography
                component="dd"
                color="textSecondary"
                variant="subtitle2"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {member.roles.includes('Coordinator') && (
                  <Icon color="gray" path={mdiCrown} style={{ marginRight: '5px', width: '15px', height: '15px' }} />
                )}
                {member.roles.join(', ')}
              </Typography>
            </Grid>
          </Grid>
        ))}
      </Stack>
    </Box>
  );
};

export default ProjectTeamMembers;
