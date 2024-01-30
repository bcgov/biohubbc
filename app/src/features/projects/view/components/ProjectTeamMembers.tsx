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
      return { display_name: member.display_name, roles: member.project_role_names };
    })
    .sort((a, b) => {
      const roleA = a.roles[0] || '';
      const roleB = b.roles[0] || '';
      return roleOrder[roleA] - roleOrder[roleB];
    });

  return (
    <Box component="dl" my={0}>
      <Stack spacing={1}>
        {projectTeamMembers.map((member) => (
          <Grid
            container
            spacing={0}
            key={member.display_name}
            sx={{ justifyContent: 'space-between', display: 'flex' }}>
            <Grid item sm={6}>
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
