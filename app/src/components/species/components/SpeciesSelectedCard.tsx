import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, Paper } from '@mui/material';
import grey from '@mui/material/colors/grey';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import SpeciesCard from './SpeciesCard';

interface ISpeciesSelectedCardProps {
  index: number;
  species: ITaxonomy;
  handleRemove: (tsn: number) => void;
}

const SpeciesSelectedCard = (props: ISpeciesSelectedCardProps) => {
  const { index, species, handleRemove } = props;

  return (
    <Paper variant="outlined" sx={{ mt: 1, background: grey[100] }}>
      <Box display="flex" alignItems="center" px={2} py={1.5}>
        <Box flex="1 1 auto">
          <SpeciesCard commonNames={species.commonNames} scientificName={species.scientificName} tsn={species.tsn} rank={species.rank} kingdom={species.kingdom}/>
        </Box>
        <Box flex="0 0 auto">
          <IconButton
            data-testid={`remove-species-button-${index}`}
            sx={{
              ml: 2
            }}
            aria-label="remove species"
            onClick={() => handleRemove(species.tsn)}>
            <Icon path={mdiClose} size={1}></Icon>
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default SpeciesSelectedCard;
