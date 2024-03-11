import { mdiCrown } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import assert from 'assert';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';

export interface IProjectParticipantsRoles {
  display_name: string;
  roles: string[];
}

const TeamMembers = () => {
  const projectContext = useContext(ProjectContext);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  // Define a custom sorting order for roles
  const roleOrder: { [key: string]: number } = {
    Coordinator: 1,
    Collaborator: 2,
    Observer: 3
  };

  const projectTeamMembers: IProjectParticipantsRoles[] = projectContext.projectDataLoader.data.projectData.participants
    .map((member) => {
      return { display_name: member.display_name, roles: member.project_role_names };
    })
    .sort((a, b) => {
      const roleA = a.roles[0] || '';
      const roleB = b.roles[0] || '';
      return roleOrder[roleA] - roleOrder[roleB];
    });

  return (
    <Stack spacing={1}>
      {/* {projectContext.projectDataLoader.data.projectData.participants.map((member) => (
        <Box display="flex" alignItems="center">
          <Box sx={{ height: '30px', width: '30px', borderRadius: '50%' }} bgcolor={grey[200]} mr={1}></Box>
          <Typography variant="body1" color="textSecondary">
            {member.display_name}
          </Typography>
        </Box>
      ))}
       */}
      {projectTeamMembers.map((member) => (
        <Grid container spacing={0} key={member.display_name} sx={{ justifyContent: 'space-between', display: 'flex' }}>
          <Grid item sm={8}>
            <Box display="flex" alignItems="center">
              <Box
                sx={{ height: '30px', width: '30px', minWidth: '30px', borderRadius: '50%' }}
                bgcolor={grey[200]}
                mr={1}
              />
              <Typography component="dd" variant="body2" color="textSecondary">
                {member.display_name}
              </Typography>
            </Box>
          </Grid>
          <Grid item sm={4} alignItems="center" display="flex">
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
  );
};
export default TeamMembers;
