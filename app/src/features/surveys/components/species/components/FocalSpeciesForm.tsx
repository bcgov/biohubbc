import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { FocalSpeciesAlert } from 'features/surveys/components/species/components/FocalSpeciesAlert';
import { FocalSpeciesEcologicalUnitsForm } from 'features/surveys/components/species/components/FocalSpeciesEcologicalUnitsForm';
import { ITaxonomyWithEcologicalUnits } from 'features/surveys/components/species/SpeciesForm';
import { FieldArray, useFormikContext } from 'formik';
import { ICreateSurveyRequest, IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import get from 'lodash-es/get';
import { TransitionGroup } from 'react-transition-group';

/**
 * Returns a form control for selecting focal species and ecological units for each focal species.
 *
 * @return {*}
 */
export const FocalSpeciesForm = () => {
  const { values } = useFormikContext<ICreateSurveyRequest | IEditSurveyRequest>();

  const selectedSpecies: ITaxonomyWithEcologicalUnits[] = get(values, 'species.focal_species') ?? [];

  return (
    <FieldArray
      name="species.focal_species"
      render={(arrayHelpers) => {
        return (
          <Stack gap={2}>
            <FocalSpeciesAlert />

            <SpeciesAutocompleteField
              formikFieldName={'species.focal_species'}
              label={'Species'}
              required={true}
              handleSpecies={(species) => {
                if (values.species.focal_species.some((focalSpecies) => focalSpecies.tsn === species.tsn)) {
                  // Species was already added, do not add again
                  return;
                }

                arrayHelpers.push({ ...species, ecological_units: [] });
              }}
              clearOnSelect={true}
            />

            <TransitionGroup>
              {selectedSpecies.map((species, index) => (
                <Collapse key={species.tsn}>
                  <Paper
                    component={Stack}
                    gap={3}
                    variant="outlined"
                    sx={{ px: 3, py: 2, background: grey[50], my: 1 }}>
                    <SpeciesSelectedCard
                      species={species}
                      index={index}
                      handleRemove={() => {
                        arrayHelpers.remove(index);
                      }}
                    />
                    <FocalSpeciesEcologicalUnitsForm species={species} index={index} />
                  </Paper>
                </Collapse>
              ))}
            </TransitionGroup>
          </Stack>
        );
      }}
    />
  );
};
