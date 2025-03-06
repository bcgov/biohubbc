import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { TransitionGroup } from 'react-transition-group';

export interface ISelectedAnimalSpeciesProps {
  selectedSpecies: IPartialTaxonomy[];
  handleRemoveSpecies?: (species_id: number) => void;
}

/**
 * Returns a stack of selected species cards.
 *
 * @param props {ISelectedAnimalSpeciesProps}
 * @returns
 */
const SelectedAnimalSpecies = (props: ISelectedAnimalSpeciesProps) => {
  const { selectedSpecies, handleRemoveSpecies } = props;

  return (
    <TransitionGroup>
      {selectedSpecies.map((species, speciesIndex) => {
        return (
          <Collapse key={species.tsn}>
            <Paper component={Stack} gap={3} variant="outlined" sx={{ px: 3, py: 2, background: grey[50], my: 1 }}>
              <SpeciesSelectedCard index={speciesIndex} species={species} handleRemove={handleRemoveSpecies} />
            </Paper>
          </Collapse>
        );
      })}
    </TransitionGroup>
  );
};

export default SelectedAnimalSpecies;
