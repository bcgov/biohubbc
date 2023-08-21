import { Box, Typography } from '@mui/material';

interface IUserCard {
  name: string;
  email: string;
  agency: string;
  type: string;
}
const UserCard: React.FC<IUserCard> = (props) => {
  return (
    <Box>
      <Typography variant="h5">{props.name}</Typography>
      <Box display={'flex'}>
        <Typography variant="subtitle2">{props.email}</Typography>
        <Typography sx={{ marginX: 1 }} variant="subtitle2">
          {props.agency}
        </Typography>
        <Typography variant="subtitle2">{props.type}</Typography>
      </Box>
    </Box>
  );
};

export default UserCard;
