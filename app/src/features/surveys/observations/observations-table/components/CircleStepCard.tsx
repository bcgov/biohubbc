import { Box, Grid, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';

interface ICircleStepCard {
  number: number;
  title: string;
  description: string;
  resources?: React.ReactNode;
}

const CircleStepCard = (props: ICircleStepCard) => {
  return (
    <Grid container p={2}>
      <Grid item xs={1}>
        <Box
          width="2.2rem"
          height="2.2rem"
          bgcolor={grey[500]}
          borderRadius="50%"
          textAlign="center"
          alignItems="center"
          justifyContent="center"
          display="flex">
          <Typography variant="h3" color="#fff" textAlign="center" alignItems="center">
            {props.number}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={11}>
        <Typography variant="h3" m={1} mt={0.75}>
          {props.title}
        </Typography>
        <Typography variant="body1" m={1}>
          {props.description}
        </Typography>
        <Typography variant="body1" m={1}>
          {props.resources}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default CircleStepCard;
