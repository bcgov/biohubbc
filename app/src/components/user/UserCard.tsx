import { Box, Typography } from '@mui/material';

interface IUserCard {
  name: string;
  email: string | null;
  agency: string | null;
  type: string | null;
}
const UserCard: React.FC<IUserCard> = (props) => {
  return (
    <Box>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">{props.name}</Typography>
      </Box>
      <Box my={0.25}>
        <Typography variant="subtitle2" color="textSecondary">
          <Box component="span">
            {props.email}
          </Box>
          <Box component="span">
            &nbsp;&middot;&nbsp;{props.agency}
          </Box>
          <Box component="span">
            &nbsp;&middot;&nbsp;{props.type}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default UserCard;
