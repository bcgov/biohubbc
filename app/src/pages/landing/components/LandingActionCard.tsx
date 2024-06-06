import Box, { BoxProps } from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

interface ILandingActionCardProps extends BoxProps {
  title: string;
  subtext: string;
  to: string;
}

const LandingActionCard = (props: ILandingActionCardProps) => {
  const theme = useTheme();
  return (
    <Box flex="1 1 auto">
      <Box mb={2} flex="1 1 auto" minHeight="200px" bgcolor={theme.palette.primary.light} />
      <RouterLink to={props.to}>
        <Typography my={0.5} variant="h3" color="primary">
          {props.title}
        </Typography>
      </RouterLink>

      <Typography variant="body1" color="textSecondary">
        {props.subtext}
      </Typography>
    </Box>
  );
};

export default LandingActionCard;
