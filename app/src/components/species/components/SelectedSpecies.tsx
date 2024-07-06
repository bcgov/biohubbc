import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { TransitionGroup } from 'react-transition-group';

export interface ISelectedSpeciesProps {
  /**
   * List of selected species to display.
   *
   * @type {IPartialTaxonomy[]}
   * @memberof ISelectedSpeciesProps
   */
  selectedSpecies: IPartialTaxonomy[];
  /**
   * Callback to remove a species from the selected species list.
   * If not provided, the remove button will not be displayed.
   *
   * @memberof ISelectedSpeciesProps
   */
  handleRemoveSpecies?: (species_id: number) => void;
}

const SelectedSpecies = (props: ISelectedSpeciesProps) => {
  const { selectedSpecies, handleRemoveSpecies } = props;

  return (
    <Box>
      <TransitionGroup>
        {selectedSpecies &&
          selectedSpecies.map((species: IPartialTaxonomy, index: number) => {
            return (
              <Collapse key={species.tsn}>
                <SpeciesSelectedCard index={index} species={species} handleRemove={handleRemoveSpecies} />
              </Collapse>
            );
          })}
      </TransitionGroup>
    </Box>
  );
};

export default SelectedSpecies;
