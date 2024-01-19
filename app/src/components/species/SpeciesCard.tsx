import { Box, Typography } from '@mui/material';

interface ISpeciesCard {
  name: string;
  subtext: string;
}
const SpeciesCard: React.FC<ISpeciesCard> = (props) => {
  // combine all text fields and join them with a middot
  const subTitle = [props.subtext].filter((item) => item !== null).join(`\u00A0\u00B7\u00A0`);
  return (
    <Box>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          {props.name}
        </Typography>
      </Box>
      <Box my={0.25}>
        <Typography variant="subtitle2" color="textSecondary">
          {subTitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default SpeciesCard;
