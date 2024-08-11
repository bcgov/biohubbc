import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import SpeciesSelectedCard from 'components/species/components/SpeciesSelectedCard';
import { EcologicalUnitsSelect } from 'components/species/ecological-units/EcologicalUnitsSelect';
import { initialEcologicalUnitValues } from 'features/surveys/animals/animal-form/components/ecological-units/EcologicalUnitsForm';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ICollectionCategory } from 'interfaces/useCritterApi.interface';
import { ICreateSurveyRequest, IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { TransitionGroup } from 'react-transition-group';

export interface ISelectedSpeciesProps {
  name: string;
  selectedSpecies: IPartialTaxonomy[];
  handleRemoveSpecies?: (species_id: number) => void;
  ecologicalUnits?: ICollectionCategory[];
  isLoading?: boolean;
}

const SelectedSurveySpecies = (props: ISelectedSpeciesProps) => {
  const { selectedSpecies, handleRemoveSpecies, name, ecologicalUnits, isLoading } = props;

  const { values } = useFormikContext<ICreateSurveyRequest | IEditSurveyRequest>();

  return (
    <TransitionGroup>
      {selectedSpecies.map((species, speciesIndex) => {
        const ecologicalUnitsForSpecies =
          ecologicalUnits?.filter((category) => category.itis_tsn === species.tsn) ?? [];
        const selectedUnits = values.species.focal_species[speciesIndex]?.ecological_units;

        return (
          <Collapse key={species.tsn}>
            <Paper component={Stack} gap={3} variant="outlined" sx={{ p: 3, background: grey[50], my: 1 }}>
              <SpeciesSelectedCard index={speciesIndex} species={species} handleRemove={handleRemoveSpecies} />

              <FieldArray
                name={`${name}.[${speciesIndex}].ecological_units`}
                render={(arrayHelpers: FieldArrayRenderProps) => (
                  <Stack gap={2}>
                    {selectedUnits.map((ecological_unit, ecologicalUnitIndex) => (
                      <EcologicalUnitsSelect
                        key={ecological_unit.critterbase_collection_category_id ?? ecologicalUnitIndex}
                        categoryFieldName={`${name}[${speciesIndex}].ecological_units[${ecologicalUnitIndex}].critterbase_collection_category_id`}
                        unitFieldName={`${name}[${speciesIndex}].ecological_units[${ecologicalUnitIndex}].critterbase_collection_unit_id`}
                        selectedCategoryIds={values.species.focal_species[speciesIndex].ecological_units.map(
                          (unit) => unit.critterbase_collection_category_id
                        )}
                        ecologicalUnits={ecologicalUnitsForSpecies}
                        arrayHelpers={arrayHelpers}
                        index={ecologicalUnitIndex}
                      />
                    ))}
                    <Box>
                      {isLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Button
                          color="primary"
                          variant="outlined"
                          data-testid="ecological-unit-button"
                          onClick={() => arrayHelpers.push(initialEcologicalUnitValues)}
                          startIcon={<Icon path={mdiPlus} size={0.75} />}
                          aria-label="Add Ecological Unit"
                          disabled={
                            !(
                              ecologicalUnitsForSpecies.length &&
                              selectedUnits.length < ecologicalUnitsForSpecies.length
                            )
                          }
                          sx={{ textTransform: 'uppercase' }}>
                          Add Ecological Unit
                        </Button>
                      )}
                    </Box>
                  </Stack>
                )}
              />
            </Paper>
          </Collapse>
        );
      })}
    </TransitionGroup>
  );
};

export default SelectedSurveySpecies;
