import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import AlertBar from 'components/alert/AlertBar';
import { ITaxonomyWithEcologicalUnits } from 'features/surveys/components/species/SpeciesForm';
import { useFormikContext } from 'formik';
import { ICreateSurveyRequest, IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import get from 'lodash-es/get';
import { TransitionGroup } from 'react-transition-group';
import SelectedSurveySpecies from '../../../../../components/species/components/SelectedSurveySpecies';
import SpeciesAutocompleteField from '../../../../../components/species/components/SpeciesAutocompleteField';

/**
 * Returns an autocomplete component for selecting focal species and ecological units for
 * each focal species on the survey form
 *
 * @returns
 */
const FocalSpeciesComponent = () => {
  const { values, setFieldValue, setFieldError, errors, submitCount } = useFormikContext<
    ICreateSurveyRequest | IEditSurveyRequest
  >();

  const selectedSpecies: ITaxonomyWithEcologicalUnits[] = get(values, 'species.focal_species') || [];

  const handleAddSpecies = (species?: IPartialTaxonomy) => {
    // Add species with empty ecological units array
    setFieldValue(`species.focal_species[${selectedSpecies.length}]`, { ...species, ecological_units: [] });
    setFieldError(`species.focal_species`, undefined);
  };

  const handleRemoveSpecies = (species_id: number) => {
    const filteredSpecies = selectedSpecies.filter((value: ITaxonomyWithEcologicalUnits) => {
      return value.tsn !== species_id;
    });
    setFieldValue('species.focal_species', filteredSpecies);
  };

  console.log(errors);

  return (
    <Stack gap={2}>
      {submitCount > 0 &&
        errors &&
        get(errors, 'species.focal_species') &&
        !Array.isArray(get(errors, 'species.focal_species')) && (
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

      <TransitionGroup>
        {selectedSpecies.map((species, index) => (
          <Collapse key={species.tsn}>
            <SelectedSurveySpecies
              name="species.focal_species"
              selectedSpecies={species}
              handleRemoveSpecies={handleRemoveSpecies}
              speciesIndex={index}
            />
          </Collapse>
        ))}
      </TransitionGroup>
    </Stack>
  );
};

export default FocalSpeciesComponent;
