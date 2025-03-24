import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Paper, { PaperProps } from '@mui/material/Paper';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import SpeciesCard from './SpeciesCard';

interface ISpeciesSelectedCardProps extends PaperProps {
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
  handleRemove?: (tsn?: number) => void;
  /**
   * The index of the component in the list.
   *
   * @type {number}
   * @memberof ISpeciesSelectedCardProps
   */
  index?: number;
}

const SpeciesSelectedCard = (props: ISpeciesSelectedCardProps) => {
  const { index, species, handleRemove, ...paperProps } = props;

  return (
    <Paper
      variant="outlined"
      {...paperProps}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        bgcolor: grey[100],
        ...paperProps.sx
      }}>
      <SpeciesCard taxon={species} />

      {handleRemove && (
        <Box flex="0 0 auto" ml={2}>
          <IconButton
            data-testid={`remove-species-button-${index}`}
            aria-label="remove species"
            onClick={() => handleRemove(species.tsn)}>
            <Icon path={mdiClose} size={1}></Icon>
          </IconButton>
        </Box>
      )}
    </Paper>
  );
};

export default SpeciesSelectedCard;
