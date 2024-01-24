import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ISpeciesAutocompleteField } from 'components/fields/SpeciesAutocompleteField';
import SpeciesCard from './SpeciesCard';

interface ISpeciesSelectedCardProps {
  index: number;
  species: ISpeciesAutocompleteField;
  error?: JSX.Element | undefined;
  handleRemove: (id: number) => void;
  label: string;
}

const SpeciesSelectedCard: React.FC<ISpeciesSelectedCardProps> = (props) => {
  const { index, species, error, handleRemove } = props;

  return (
    <Box mt={1} className="speciesItemContainer">
      <Paper
        variant="outlined"
        className={error ? 'speciesItemError' : 'speciesItem'}
        sx={{
          background: grey[100],
          '&.speciesItemError': {
            borderColor: 'error.main',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'error.main'
            },
            '& + p': {
              pt: 0.75,
              pb: 0.75,
              pl: 2
            }
          }
        }}>
        <Box display="flex" alignItems="center" px={2} py={1.5}>
          <Box flex="1 1 auto">
            <SpeciesCard name={species.label} subtext={species.scientificName} />
          </Box>
          <Box flex="0 0 auto">
            <IconButton
              data-testid={`remove-species-role-button-${index}`}
              sx={{
                ml: 2
              }}
              aria-label="remove species from project team"
              onClick={() => handleRemove(species.id)}>
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
