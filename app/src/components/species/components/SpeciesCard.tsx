import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { getTaxonRankColour } from 'constants/colours';
import { IPartialTaxonomy, ITaxonomy } from 'interfaces/useTaxonomyApi.interface';

interface ISpeciesCardProps {
  taxon: ITaxonomy | IPartialTaxonomy;
}

const SpeciesCard = (props: ISpeciesCardProps) => {
  const { taxon } = props;

  // combine all common names and join them with a middot
  const commonNames = taxon.commonNames.filter((item) => item !== null).join(`\u00A0\u00B7\u00A0`);

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
            {taxon.scientificName.split(' ')?.length > 1 ? (
              <em>{taxon.scientificName}</em>
            ) : (
              <>{taxon.scientificName}</>
            )}
          </Typography>
          {taxon?.rank && (
            <ColouredRectangleChip sx={{ mx: 1 }} label={taxon.rank} colour={getTaxonRankColour(taxon.rank)} />
          )}
        </Stack>
        <Typography variant="subtitle2" color="textSecondary">
          {commonNames}
        </Typography>
      </Box>
      <Typography color="textSecondary" variant="body2" title="Taxonomic Serial Number">
        {taxon.tsn}
      </Typography>
    </Stack>
  );
};

export default SpeciesCard;
