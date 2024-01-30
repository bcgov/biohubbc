import { Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { TransitionGroup } from 'react-transition-group';
import { ISpeciesAutocompleteField } from './SpeciesAutocompleteField';

export interface ISelectedSpeciesProps {
  selectedSpecies: ISpeciesAutocompleteField[];
  handleRemoveSpecies: (species_id: number) => void;
}

const SelectedSpecies = (props: ISelectedSpeciesProps) => {
  const { selectedSpecies, handleRemoveSpecies } = props;

  return (
    <>
      <Box>
        <TransitionGroup>
          {selectedSpecies &&
            selectedSpecies.map((species: ISpeciesAutocompleteField, index: number) => {
              return (
                <Collapse key={species.id}>
                  <SpeciesSelectedCard
                    index={index}
                    species={species}
                    handleRemove={handleRemoveSpecies}
                    label={species.label}
                  />
                </Collapse>
              );
            })}
        </TransitionGroup>
      </Box>
    </>
  );
};

export default SelectedSpecies;
