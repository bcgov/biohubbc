import { Box, Typography } from '@mui/material';

interface ISpeciesCard {
  name: string;
  subtext: string;
}
const SpeciesCard = (props: ISpeciesCard) => {
  return (
    <Box>
      <Box>
        <Typography component="div" variant="subtitle1" fontWeight="bold">
          {props.name}
        </Typography>
      </Box>
      <Box>
        <Typography component="div" variant="subtitle2" color="textSecondary">
          {props.subtext}
        </Typography>
      </Box>
    </Box>
  );
};

export default SpeciesCard;
