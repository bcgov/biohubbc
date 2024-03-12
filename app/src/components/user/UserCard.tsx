import { Box, Typography } from '@mui/material';

interface IUserCard {
  name: string;
  email: string | null;
  agency: string | null;
  type: string | null;
}
const UserCard: React.FC<IUserCard> = (props) => {
  // combine all text fields and join them with a middot
  const subTitle = [props.email, props.agency, props.type].filter((item) => item !== null).join(`\u00A0\u00B7\u00A0`);
  return (
    <Box>
      <Box>
        <Typography component="div" variant="body2" fontWeight="bold">
          {props.name}
        </Typography>
      </Box>
      <Box>
        <Typography component="div" variant="subtitle2" color="textSecondary">
          {subTitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserCard;
