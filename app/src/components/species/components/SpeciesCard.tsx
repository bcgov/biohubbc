import Box from '@mui/material/Box';
import { blueGrey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { taxonRankColours } from 'constants/taxon';

interface ISpeciesCard {
  commonNames: string[];
  scientificName: string;
  tsn: number;
  rank: string;
  kingdom: string;
}

const SpeciesCard = (props: ISpeciesCard) => {
  // combine all common names and join them with a middot
  const commonNames = props.commonNames.filter((item) => item !== null).join(`\u00A0\u00B7\u00A0`);

  return (
    <Stack flexDirection="row" justifyContent="space-between" flex="1 1 auto">
      <Box>
        <Stack direction="row" gap={1} mb={0.25}>
          <Typography
            variant="body2"
            component="span"
            className="speciesCommonName"
            fontWeight={700}
            sx={{
              display: 'inline-block',
              '&::first-letter': {
                textTransform: 'capitalize'
              }
            }}>
            {props.scientificName.split(' ')?.length > 1 ? (
              <em>{props.scientificName}</em>
            ) : (
              <>{props.scientificName}</>
            )}
          </Typography>
          {props.rank && (
            <ColouredRectangleChip
              sx={{ mx: 1 }}
              label={props.rank}
              colour={taxonRankColours.find((color) => color.ranks.includes(props.rank))?.color ?? blueGrey}
            />
          )}
        </Stack>
        <Typography variant="subtitle2" color="textSecondary">
          {commonNames}
        </Typography>
      </Box>
      <Typography color="textSecondary" variant="body2" title="Taxonomic Serial Number">
        {props.tsn}
      </Typography>
    </Stack>
  );
};

export default SpeciesCard;
