import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import clsx from 'clsx';
import { ISpeciesAutocompleteField } from 'components/species/components/SpeciesAutocompleteField';
import SpeciesCard from './SpeciesCard';
interface ISpeciesSelectedCardProps {
  index: number;
  species: ISpeciesAutocompleteField;
  error?: JSX.Element | undefined;
  handleRemove: (tsn: number) => void;
  label: string;
}

const SpeciesSelectedCard = (props: ISpeciesSelectedCardProps) => {
  const { index, species, error, handleRemove } = props;

  return (
    <Box mt={1} className="speciesItemContainer">
      <Paper
        variant="outlined"
        className={clsx({ '--error': error })}
        sx={{
          background: grey[100],
          '&.--error': {
            borderColor: 'error.main',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'error.main'
            }
          }
        }}>
        <Box display="flex" alignItems="center" px={2} py={1.5}>
          <Box flex="1 1 auto">
            <SpeciesCard name={species.commonName || species.scientificName} subtext={species.scientificName} />
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
      {error}
    </Box>
  );
};

export default SpeciesSelectedCard;
