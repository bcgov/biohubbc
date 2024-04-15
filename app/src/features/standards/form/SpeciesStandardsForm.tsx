import { Box } from '@mui/material';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { useState } from 'react';
import SpeciesStandardsResults from '../view/SpeciesStandardsResults';

/**
 * Form component for looking up data standards for a species
 *
 * @return {*}
 */
const SpeciesStandardsForm = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<ITaxonomy>();

  return (
    <>
      <SpeciesAutocompleteField
        formikFieldName="tsn"
        label={''}
        handleSpecies={(value) => {
          setSelectedSpecies(value);
        }}
      />
      <Box my={2}>
        <SpeciesStandardsResults selectedSpecies={selectedSpecies} />
      </Box>
    </>
  );
};

export default SpeciesStandardsForm;
