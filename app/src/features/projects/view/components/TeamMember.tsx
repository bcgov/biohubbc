import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { PROJECT_ROLE_ICONS } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import { useContext, useMemo } from 'react';
import { getRandomHexColor } from 'utils/Utils';
import { TeamMemberAvatar } from './TeamMemberAvatar';

interface IProjectParticipantsRoles {
  display_name: string;
  roles: string[];
  initials: string;
  avatarColor: string;
}

// Define a custom sorting order for roles
const roleOrder: { [key: string]: number } = {
  Coordinator: 1,
  Collaborator: 2,
  Observer: 3
};

const TeamMembers = () => {
  const projectContext = useContext(ProjectContext);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const projectTeamMembers: IProjectParticipantsRoles[] = useMemo(() => {
    return (
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
        }) ?? []
    );
  }, [projectContext.projectDataLoader.data.projectData.participants]);

  return (
    <Stack spacing={1}>
      {projectTeamMembers.map((member) => {
        return (
          <Box display="flex" alignItems="center" key={member.display_name}>
            {/* Avatar Box */}
            <Box mr={1}>
              <TeamMemberAvatar color={member.avatarColor} label={member.initials} />
            </Box>

            {/* Member Display Name */}
            <Typography variant="body2" color="textSecondary" display="flex" alignItems="center">
              {member.display_name}
            </Typography>
            {/* Member Roles with Icons */}
            {member.roles.map((role) => (
              <Box key={role} ml={0.75} mt={0.5}>
                <Icon path={PROJECT_ROLE_ICONS[role] ?? ''} size={0.75} color={grey[600]} />
              </Box>
            ))}
          </Box>
        );
      })}
    </Stack>
  );
};
export default TeamMembers;
