import { Box, Grid, Typography } from '@mui/material';
// import { grey } from '@mui/material/colors';

interface ICircleStepCard {
  number: number;
  title: string;
  description: string;
  resources?: React.ReactNode;
}

const CircleStepCard = (props: ICircleStepCard) => {
  console.log(props);
  return (
    <Grid container p={2}>
      <Grid item xs={1}>
        <Box
          width="2.5rem"
          height="2.5rem"
          bgcolor='text.secondary'
          borderRadius="50%"
          textAlign="center"
          alignItems="center"
          justifyContent="center"
          display="flex">
          <Typography variant="h2" color="#fff" textAlign="center" alignItems="center">
            {props.number}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={11}>
        <Typography variant="h3" m={1}>
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
