import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import AlertBar from 'components/alert/AlertBar';
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
            <AlertBar
              text={
                <>
                  We are working with the &zwnj;
                  <a href="https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/conservation-data-centre">
                    Conservation Data Center &zwnj;
                  </a>
                  to integrate British Columbia's official taxonomy data shown in the &zwnj;
                  <a href="https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/conservation-data-centre/explore-cdc-data/species-and-ecosystems-explorer">
                    BC Species & Ecosystems Explorer
                  </a>
                  . Temporarily, taxonomic names come from the &zwnj;
                  <a href="https://itis.gov/">Integrated Taxonomy Information System</a>.
                </>
              }
              severity="info"
              title="Species Taxonomy"
              variant="standard"
            />
            <FocalSpeciesAlert />

            <SpeciesAutocompleteField
              formikFieldName={'species.focal_species'}
              label={'Species'}
              helpText={'If you focused on multiple related species, you can select a higher taxon (eg. birds, bats).'}
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
