import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import SpeciesCard from './SpeciesCard';

interface ISpeciesSelectedCardProps {
  /**
   * The species to display.
   *
   * @type {IPartialTaxonomy}
   * @memberof ISpeciesSelectedCardProps
   */
  species: IPartialTaxonomy;
  /**
   * Callback to remove a species from the selected species list.
   * If not provided, the remove button will not be displayed.
   *
   * @memberof ISpeciesSelectedCardProps
   */
  handleRemove?: (tsn: number) => void;
  /**
   * The index of the component in the list.
   *
   * @type {number}
   * @memberof ISpeciesSelectedCardProps
   */
  index: number;
}

const SpeciesSelectedCard = (props: ISpeciesSelectedCardProps) => {
  const { index, species, handleRemove } = props;

  return (
    <Paper variant="outlined" sx={{ mt: 1, background: grey[100] }}>
      <Box display="flex" alignItems="center" px={2} py={1.5}>
        <Box flex="1 1 auto">
          <SpeciesCard taxon={species} />
        </Box>
        {handleRemove && (
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
        )}
      </Box>
    </Paper>
  );
};

export default SpeciesSelectedCard;
