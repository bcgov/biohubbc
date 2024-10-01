import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { getTaxonRankColour, TaxonRankKeys } from 'constants/colours';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { IPartialTaxonomy, ITaxonomy } from 'interfaces/useTaxonomyApi.interface';

interface ISpeciesCardProps {
  taxon: ITaxonomy | IPartialTaxonomy;
}

const SpeciesCard = (props: ISpeciesCardProps) => {
  const { taxon } = props;

  // combine all common names and join them with a middot
  const commonNames = taxon.commonNames.filter((item) => item !== null).join(`\u00A0\u00B7\u00A0`);

  return (
    <Stack flexDirection="row" justifyContent="space-between" flex="1 1 auto" position="relative">
      <Box>
        <Stack direction="row" gap={1} mb={0.5}>
          <ScientificNameTypography name={taxon.scientificName} fontWeight={700} />
          {taxon?.rank && (
            <ColouredRectangleChip
              sx={{ mx: 1 }}
              label={taxon.rank}
              colour={getTaxonRankColour(taxon.rank as TaxonRankKeys)}
            />
          )}
        </Stack>
        <Typography variant="subtitle2" color="textSecondary">
          {commonNames}
        </Typography>
      </Box>
      <Chip right={5} label={taxon.tsn} variant="filled" component={Box} title="Taxonomic serial number" />
    </Stack>
  );
};

export default SpeciesCard;
