import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ITeamMemberAvatarProps {
  color: string;
  label: string;
  title?: string;
}

/**
 * Returns a circular icon representing a user, typically displaying their initials as the label
 * @param props
 * @returns
 */
export const TeamMemberAvatar = (props: ITeamMemberAvatarProps) => {
  const { color, label, title } = props;
  return (
    <Box
      title={title}
      sx={{
        height: '35px',
        width: '35px',
        minWidth: '35px',
        borderRadius: '50%',
        bgcolor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <Typography sx={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700, userSelect: 'none' }}>{label}</Typography>
    </Box>
  );
};
