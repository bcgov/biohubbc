import { mdiCrown } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import assert from 'assert';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';

export interface IProjectParticipantsRoles {
  display_name: string;
  roles: string[];
  initials: string;
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
      const initials = member.display_name
        .split(',')
        .map((name) => name.trim().slice(0, 1).toUpperCase())
        .reverse()
        .join('');
      return { display_name: member.display_name, roles: member.project_role_names, initials };
    })
    .sort((a, b) => {
      const roleA = a.roles[0] || '';
      const roleB = b.roles[0] || '';
      return roleOrder[roleA] - roleOrder[roleB];
    });

  function getRandomHexColor(seed: number) {
    // Define a seeded random number generator
    const seededRandom = (min: number, max: number) => {
      const x = Math.sin(seed++) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    // Generate a random color component and convert it to a two-digit hex value
    const randomComponent = () => seededRandom(70, 150).toString(16).padStart(2, '0');

    // Concatenate three random color components to form a hex color
    const randomColor = `#${randomComponent()}${randomComponent()}${randomComponent()}`;

    return randomColor;
  }

  // Example usage with seed value 42
  console.log(getRandomHexColor(42));

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
      {projectTeamMembers.map((member, index) => (
        <Grid container spacing={0} key={member.display_name} sx={{ justifyContent: 'space-between', display: 'flex' }}>
          <Grid item sm={8}>
            <Box display="flex" alignItems="center">
              <Box
                sx={{ height: '35px', width: '35px', minWidth: '30px', borderRadius: '50%' }}
                bgcolor={getRandomHexColor(index)}
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={1}>
                <Typography sx={{ fontSize: '0.9rem', color: '#fff' }} variant="body2">
                  {member.initials}
                </Typography>
              </Box>
              <Typography variant="body1" color="textSecondary">
                {member.display_name}
              </Typography>
            </Box>
          </Grid>
          <Grid item sm={4} alignItems="center" display="flex">
            <Typography
            textAlign='end'
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
