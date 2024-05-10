import Box from '@mui/material/Box';
import AlertBar from 'components/alert/AlertBar';
import { useFormikContext } from 'formik';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import get from 'lodash-es/get';
import SelectedSpecies from './components/SelectedSpecies';
import SpeciesAutocompleteField from './components/SpeciesAutocompleteField';

const AncillarySpeciesComponent = () => {
  const { values, setFieldValue, setFieldError, errors } = useFormikContext<ITaxonomy[]>();

  const selectedSpecies: ITaxonomy[] = get(values, 'species.ancillary_species') || [];

  const handleAddSpecies = (species?: ITaxonomy) => {
    setFieldValue(`species.ancillary_species[${selectedSpecies.length}]`, species);
    setFieldError(`species.ancillary_species`, undefined);
  };

  const handleRemoveSpecies = (species_id: number) => {
    const filteredValues = selectedSpecies.filter((value: ITaxonomy) => {
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
        handleSpecies={handleAddSpecies}
        clearOnSelect={true}
      />
      <SelectedSpecies selectedSpecies={selectedSpecies} handleRemoveSpecies={handleRemoveSpecies} />
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
    </>
  );
};

export default AncillarySpeciesComponent;
