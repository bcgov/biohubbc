import Box, { BoxProps } from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

interface ILandingActionCardProps extends BoxProps {
  title: string;
  subtext: string;
  to: string;
  bgcolor?: string;
}

const LandingActionCard = (props: ILandingActionCardProps) => {
  return (
    <Card elevation={1}>
      <Box flex="1 1 auto" minHeight="150px" bgcolor={props.bgcolor} />
      <Box px={3} py={2}>
        <RouterLink to={props.to}>
          <Typography my={0.5} variant="h3" color="primary">
            {props.title}
          </Typography>
        </RouterLink>

        <Typography variant="body1" color="textSecondary">
          {props.subtext}
        </Typography>
      </Box>
    </Card>
  );
};

export default LandingActionCard;
