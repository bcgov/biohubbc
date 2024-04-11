import { Box } from '@mui/material';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { useState } from 'react';
import SpeciesStandardsResults from '../view/SpeciesStandardsResults';

export interface ISpeciesStandardsFormikProps {
  tsn: number;
}

const SpeciesStandardsForm = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<ITaxonomy>();
  // const formikRef = useRef<FormikProps<ISpeciesStandardsFormikProps>>(null);

  // const speciesStandardsYupSchema = yup.object({
  //   taxon: yup.string()
  // });

  // const speciesStandardsInitialValues = {
  //   tsn: 0
  // };

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
