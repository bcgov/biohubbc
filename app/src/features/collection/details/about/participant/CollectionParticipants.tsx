import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { COLLECTION_ROLE, PROJECT_ROLE_ICONS } from 'constants/roles';
import { TeamMemberAvatar } from 'features/projects/view/components/TeamMemberAvatar';
import { ICollectionParticipant } from 'interfaces/useCollectionApi.interface';
import { useMemo } from 'react';
import { getRandomHexColor } from 'utils/Utils';

const roleOrder: { [key: string]: number } = {
  [COLLECTION_ROLE.ADMIN]: 1,
  [COLLECTION_ROLE.MEMBER]: 2
};

export interface ICollectionParticipantsProps {
  participants: ICollectionParticipant[];
}

export function CollectionParticipants(props: ICollectionParticipantsProps) {
  const { participants } = props;

  const teamMembers = useMemo(() => {
    return (
      participants
        .map((member) => {
          const display_name = member.display_name;
          const roles: COLLECTION_ROLE[] = []; // <-- Fix: get roles from member
          const initials = display_name
            .split(',')
            .map((name) => name.trim().slice(0, 1).toUpperCase())
            .reverse()
            .join('');
          return {
            display_name,
            roles,
            avatarColor: getRandomHexColor(member.system_user_id),
            initials
          };
        })
        .sort((a, b) => {
          const roleA = a.roles[0] || '';
          const roleB = b.roles[0] || '';
          return (roleOrder[roleA] ?? 99) - (roleOrder[roleB] ?? 99);
        }) ?? []
    );
  }, [participants]);

  return (
    <Stack spacing={1}>
      {teamMembers.map((member) => (
        <Box display="flex" alignItems="center" key={member.display_name}>
          <Box mr={1}>
            <TeamMemberAvatar color={member.avatarColor} label={member.initials} />
          </Box>
          <Typography variant="body2" color="textSecondary" display="flex" alignItems="center">
            {member.display_name}
          </Typography>
          {member.roles.map((role) => (
            <Tooltip title={role} arrow key={role}>
              <Box ml={0.75} mt={0.5}>
                <Icon path={PROJECT_ROLE_ICONS[role] ?? ''} size={0.75} color={grey[600]} />
              </Box>
            </Tooltip>
          ))}
        </Box>
      ))}
    </Stack>
  );
}
