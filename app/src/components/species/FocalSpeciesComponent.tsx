import { Box } from '@mui/material';
import AlertBar from 'components/alert/AlertBar';
import { useFormikContext } from 'formik';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import get from 'lodash-es/get';
import SelectedSpecies from './components/SelectedSpecies';
import SpeciesAutocompleteField from './components/SpeciesAutocompleteField';

const FocalSpeciesComponent = () => {
  const { values, setFieldValue, setErrors, errors } = useFormikContext<ITaxonomy[]>();

  const selectedSpecies: ITaxonomy[] = get(values, 'species.focal_species') || [];

  const handleAddSpecies = (species: ITaxonomy) => {
    setFieldValue(`species.focal_species[${selectedSpecies.length}]`, species);
    setErrors([]);
  };

  const handleRemoveSpecies = (species_id: number) => {
    const filteredSpecies = selectedSpecies.filter((value: ITaxonomy) => {
      return value.tsn !== species_id;
    });

    setFieldValue('species.focal_species', filteredSpecies);
  };

  return (
    <>
      <SpeciesAutocompleteField
        formikFieldName={'species.focal_species'}
        label={'Focal Species'}
        required={true}
        handleAddSpecies={handleAddSpecies}
      />
      {errors && get(errors, 'species.focal_species') && (
        <Box mt={3}>
          <AlertBar
            severity="error"
            variant="standard"
            title="Missing Species"
            text={get(errors, 'species.focal_species') || 'Select a species'}
          />
        </Box>
      )}
      <SelectedSpecies selectedSpecies={selectedSpecies} handleRemoveSpecies={handleRemoveSpecies} />
    </>
  );
};

export default FocalSpeciesComponent;
