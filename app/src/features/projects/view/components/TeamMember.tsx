import { mdiAccountEdit, mdiCrown } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Stack, Typography } from '@mui/material';
import assert from 'assert';
import { ProjectContext } from 'contexts/projectContext';
import { useContext, useMemo } from 'react';

interface IProjectParticipantsRoles {
  display_name: string;
  roles: string[];
  initials: string;
  avatarColor: string;
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

  const projectTeamMembers: IProjectParticipantsRoles[] = useMemo(
    () =>
      projectContext.projectDataLoader.data?.projectData.participants
        .map((member) => {
          const initials = member.display_name
            .split(',')
            .map((name) => name.trim().slice(0, 1).toUpperCase())
            .reverse()
            .join('');
          return {
            display_name: member.display_name,
            roles: member.project_role_names,
            avatarColor: getRandomHexColor(member.system_user_id),
            initials
          };
        })
        .sort((a, b) => {
          const roleA = a.roles[0] || '';
          const roleB = b.roles[0] || '';
          return roleOrder[roleA] - roleOrder[roleB];
        }) || [],
    [projectContext.projectDataLoader.data.projectData.participants]
  );

  function getRandomHexColor(seed: number) {
    // Define a seeded random number generator
    const seededRandom = (min: number, max: number) => {
      const x = Math.sin(seed++) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    // Generate a random color component and convert it to a two-digit hex value
    const randomComponent = () => seededRandom(70, 150).toString(16).padStart(2, '0');

    // Concatenate three random color components to form a hex color
    return `#${randomComponent()}${randomComponent()}${randomComponent()}`;
  }

  return (
    <Stack spacing={1}>
      {projectTeamMembers.map((member, index) => {
        const isCoordinator = member.roles.includes('Coordinator');
        const isCollaborator = member.roles.includes('Collaborator');
        return (
          <Box display="flex" alignItems="center" key={member.display_name}>
            <Box
              sx={{ height: '35px', width: '35px', minWidth: '35px', borderRadius: '50%' }}
              bgcolor={member.avatarColor}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mr={1}>
              <Typography sx={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>{member.initials}</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" alignItems="center" display="flex">
              {member.display_name}
              {(isCoordinator || isCollaborator) && (
                <Icon
                  title={member.roles.join(', ')}
                  color="gray"
                  path={isCoordinator ? mdiCrown : mdiAccountEdit}
                  size={0.8}
                  style={{ marginLeft: '6px' }}
                />
              )}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
};
export default TeamMembers;
