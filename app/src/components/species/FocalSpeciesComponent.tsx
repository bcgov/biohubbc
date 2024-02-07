import { Box } from '@mui/material';
import AlertBar from 'components/alert/AlertBar';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import SelectedSpecies from './components/SelectedSpecies';
import SpeciesAutocompleteField, { ISpeciesAutocompleteField } from './components/SpeciesAutocompleteField';

const FocalSpeciesComponent = () => {
  const { values, setFieldValue, setErrors, errors } = useFormikContext<ISpeciesAutocompleteField[]>();

  const selectedSpecies: ISpeciesAutocompleteField[] = get(values, 'species.focal_species') || [];

  const handleAddSpecies = (species: ISpeciesAutocompleteField) => {
    setFieldValue(`species.focal_species[${selectedSpecies.length}]`, species);
    setErrors([]);
  };

  const handleRemoveSpecies = (species_id: number) => {
    const filteredSpecies = selectedSpecies.filter((value: ISpeciesAutocompleteField) => {
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
