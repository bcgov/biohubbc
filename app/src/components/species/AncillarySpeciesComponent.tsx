import { Box } from '@mui/material';
import AlertBar from 'components/alert/AlertBar';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import SelectedSpecies from './components/SelectedSpecies';
import SpeciesAutocompleteField, { ISpeciesAutocompleteField } from './components/SpeciesAutocompleteField';

const AncillarySpeciesComponent = () => {
  const { values, setFieldValue, setErrors, errors } = useFormikContext<ISpeciesAutocompleteField[]>();

  const selectedSpecies: ISpeciesAutocompleteField[] = get(values, 'species.ancillary_species') || [];

  const handleAddSpecies = (species: ISpeciesAutocompleteField) => {
    setFieldValue(`species.ancillary_species[${selectedSpecies.length}]`, species);
    setErrors([]);
  };

  const handleRemoveSpecies = (species_id: number) => {
    const filteredValues = selectedSpecies.filter((value: ISpeciesAutocompleteField) => {
      return value.tsn !== species_id;
    });

    setFieldValue('species.ancillary_species', filteredValues);
  };

  return (
    <>
      <SpeciesAutocompleteField
        formikFieldName={'species.ancillary_species'}
        label={'Ancillary Species'}
        required={false}
        handleAddSpecies={handleAddSpecies}
      />
      {errors && get(errors, 'species.ancillary_species') && (
        <Box mt={3}>
          <AlertBar
            severity="error"
            variant="standard"
            title="Missing Species"
            text={get(errors, 'species.ancillary_species') || 'Select a species'}
          />
        </Box>
      )}
      <SelectedSpecies selectedSpecies={selectedSpecies} handleRemoveSpecies={handleRemoveSpecies} />
    </>
  );
};

export default AncillarySpeciesComponent;
