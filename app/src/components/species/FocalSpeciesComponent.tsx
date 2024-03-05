import Stack from '@mui/material/Stack';
import AlertBar from 'components/alert/AlertBar';
import { useFormikContext } from 'formik';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import get from 'lodash-es/get';
import SelectedSpecies from './components/SelectedSpecies';
import SpeciesAutocompleteField from './components/SpeciesAutocompleteField';

const FocalSpeciesComponent = () => {
  const { values, setFieldValue, errors, submitCount } = useFormikContext<ITaxonomy[]>();

  const selectedSpecies: ITaxonomy[] = get(values, 'species.focal_species') || [];
  const handleAddSpecies = (species: ITaxonomy) => {
    setFieldValue(`species.focal_species[${selectedSpecies.length}]`, species);
  };

  const handleRemoveSpecies = (species_id: number) => {
    const filteredSpecies = selectedSpecies.filter((value: ITaxonomy) => {
      return value.tsn !== species_id;
    });

    setFieldValue('species.focal_species', filteredSpecies);
  };

  return (
    <Stack>
      {submitCount > 0 && errors && get(errors, 'species.focal_species') && (
        <AlertBar
          severity="error"
          variant="outlined"
          title="Focal Species missing"
          text={get(errors, 'species.focal_species') || 'Select a species'}
        />
      )}
      <SpeciesAutocompleteField
        formikFieldName={'species.focal_species'}
        label={'Focal Species'}
        required={true}
        handleAddSpecies={handleAddSpecies}
        clearOnSelect={true}
      />
      <SelectedSpecies selectedSpecies={selectedSpecies} handleRemoveSpecies={handleRemoveSpecies} />
    </Stack>
  );
};

export default FocalSpeciesComponent;
