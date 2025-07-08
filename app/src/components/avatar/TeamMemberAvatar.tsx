import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

interface ITeamMemberAvatarProps {
  color: string;
  label: string;
  tooltip?: string;
}

/**
 * Returns a circular icon representing a user, typically displaying their initials as the label
 * @param props
 * @returns
 */
export const TeamMemberAvatar = (props: ITeamMemberAvatarProps) => {
  const { color, label, tooltip } = props;
  return (
    <Tooltip title={tooltip} arrow>
      <Box
        sx={{
          height: '25px',
          width: '25px',
          minWidth: '25px',
          borderRadius: '50%',
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Typography sx={{ fontSize: '0.5rem', color: '#fff', fontWeight: 700, userSelect: 'none' }}>{label}</Typography>
      </Box>
    </Tooltip>
  );
};
