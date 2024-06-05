import Box, { BoxProps } from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';

interface ILandingActionCardProps extends BoxProps {
  title: string;
  subtext: string;
}

const LandingActionCard = (props: ILandingActionCardProps) => {
  const theme = useTheme();
  return (
    <Box flex="1 1 auto">
      <Box flex="1 1 auto" minHeight="300px" bgcolor={theme.palette.primary.light} />
      <Typography variant="h4" color="primary">
        {props.title}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {props.subtext}
      </Typography>
    </Box>
  );
};

export default LandingActionCard;
