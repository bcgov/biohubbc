import { Box, Typography } from '@mui/material';

interface ISpeciesCard {
  name: string;
  subtext: string;
}
const SpeciesCard = (props: ISpeciesCard) => {
  return (
    <Box>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          {props.name}
        </Typography>
      </Box>
      <Box my={0.25}>
        <Typography variant="subtitle2" color="textSecondary">
          {props.subtext}
        </Typography>
      </Box>
    </Box>
  );
};

export default SpeciesCard;
