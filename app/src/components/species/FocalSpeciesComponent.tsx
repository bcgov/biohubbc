import Stack from '@mui/material/Stack';
import AlertBar from 'components/alert/AlertBar';
import { ISpeciesWithEcologicalUnits } from 'features/surveys/components/species/SpeciesForm';
import { useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateSurveyRequest, IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import get from 'lodash-es/get';
import { useEffect } from 'react';
import SelectedSpecies from './components/SelectedSurveySpecies';
import SpeciesAutocompleteField from './components/SpeciesAutocompleteField';

const FocalSpeciesComponent = () => {
  const { values, setFieldValue, setFieldError, errors, submitCount } = useFormikContext<
    ICreateSurveyRequest | IEditSurveyRequest
  >();

  const selectedSpecies: ISpeciesWithEcologicalUnits[] = get(values, 'species.focal_species') || [];
  const critterbaseApi = useCritterbaseApi();

  const ecologicalUnitDataLoader = useDataLoader((tsn: number[]) =>
    critterbaseApi.xref.getTsnCollectionCategories(tsn)
  );

  const selectedSpeciesTsns = selectedSpecies.map((species) => species.tsn);

  useEffect(() => {
    if (selectedSpeciesTsns) {
      ecologicalUnitDataLoader.load(selectedSpeciesTsns);
    }
    // Should not re-run this effect on `ecologicalUnitsDataLoader.refresh` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpeciesTsns]);

  const handleAddSpecies = (species?: IPartialTaxonomy) => {
    // Add species with empty ecological units array
    setFieldValue(`species.focal_species[${selectedSpecies.length}]`, { ...species, ecological_units: [] });
    setFieldError(`species.focal_species`, undefined);
    // Fetch ecological units for new species
    if (species) {
      ecologicalUnitDataLoader.refresh([...selectedSpeciesTsns, species.tsn]);
    }
  };

  const handleRemoveSpecies = (species_id: number) => {
    const filteredSpecies = selectedSpecies.filter((value: ISpeciesWithEcologicalUnits) => {
      return value.tsn !== species_id;
    });
    setFieldValue('species.focal_species', filteredSpecies);
  };

  return (
    <Stack gap={2}>
      {submitCount > 0 && errors && get(errors, 'species.focal_species') && (
        <AlertBar
          severity="error"
          variant="outlined"
          title="Focal Species missing"
          text={(get(errors, 'species.focal_species') as string) || 'Select a species'}
        />
      )}
      <SpeciesAutocompleteField
        formikFieldName={'species.focal_species'}
        label={'Species'}
        required={true}
        handleSpecies={handleAddSpecies}
        clearOnSelect={true}
      />
      {selectedSpecies.length > 0 && (
        <SelectedSpecies
          name="species.focal_species"
          selectedSpecies={selectedSpecies}
          ecologicalUnits={ecologicalUnitDataLoader.data ?? []}
          handleRemoveSpecies={handleRemoveSpecies}
          isLoading={ecologicalUnitDataLoader.isLoading}
        />
      )}
    </Stack>
  );
};

export default FocalSpeciesComponent;
