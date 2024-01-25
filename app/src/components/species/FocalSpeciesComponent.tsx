import { Box } from '@mui/material';
import AlertBar from 'components/alert/AlertBar';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import { default as React } from 'react';
import SelectedSpecies from './components/SelectedSpecies';
import SpeciesAutocompleteField, { ISpeciesAutocompleteField } from './components/SpeciesAutocompleteField';

const FocalSpeciesComponent: React.FC = () => {
  const { values, setFieldValue, setErrors, errors } = useFormikContext<ISpeciesAutocompleteField[]>();

  const selectedSpecies: ISpeciesAutocompleteField[] = get(values, 'species.focal_species_object') || [];

  const handleAddSpecies = (species: ISpeciesAutocompleteField) => {
    setFieldValue(`species.focal_species_object[${selectedSpecies.length}]`, species);
    setFieldValue(`species.focal_species[${selectedSpecies.length}]`, species.id);
    setErrors([]);
  };

  const handleRemoveSpecies = (species_id: number) => {
    const speciesIds = get(values, 'species.focal_species') || [];
    const filteredSpeciesIds = speciesIds.filter((value: number) => {
      return value !== species_id;
    });

    const filteredSpecies = selectedSpecies.filter((value: ISpeciesAutocompleteField) => {
      return value.id !== species_id;
    });

    setFieldValue('species.focal_species_object', filteredSpecies);
    setFieldValue('species.focal_species', filteredSpeciesIds);
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
