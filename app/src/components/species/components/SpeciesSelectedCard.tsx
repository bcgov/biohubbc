import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
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
    <Box display="flex" justifyContent="space-between" alignItems="center" position="relative">
      <Box flex={0.95}>
        <SpeciesCard taxon={species} />
      </Box>

      {handleRemove && (
        <Box flex="0 0 auto" position="absolute" right={0} top={-2}>
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
  );
};

export default SpeciesSelectedCard;
