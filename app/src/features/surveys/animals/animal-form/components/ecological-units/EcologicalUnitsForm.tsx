import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { EcologicalUnitDualSelect } from 'components/species/ecological-units/EcologicalUnitDualSelect';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

export const initialEcologicalUnitValues = {
  critterbase_collection_category_id: null,
  critterbase_collection_unit_id: null
};

/**
 * Returns component for adding ecological units to an animal within the AnimalFormContainer.
 *
 * @return {*}
 */
export const EcologicalUnitsForm = () => {
  const { values } = useFormikContext<ICreateEditAnimalRequest>();

  const critterbaseApi = useCritterbaseApi();

  const ecologicalUnitsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getTsnCollectionCategories(tsn));

  useEffect(() => {
    if (values.species?.tsn) {
      ecologicalUnitsDataLoader.refresh(values.species.tsn);
    }
    // Should not re-run this effect on `ecologicalUnitsDataLoader.refresh` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.species]);

  return (
    <FieldArray
      name="ecological_units"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.ecological_units.map((ecological_unit, index) => (
              <Collapse key={ecological_unit.critter_collection_unit_id ?? index}>
                <Box mb={2}>
                  <EcologicalUnitDualSelect
                    formikCategoryFieldName={`ecological_units[${index}].collection_category_id`}
                    formikUnitFieldName={`ecological_units[${index}].collection_unit_id`}
                    ecologicalCategories={ecologicalUnitsDataLoader.data ?? []}
                    filterUnitIds={values.ecological_units.map((unit) => unit.collection_unit_id)}
                    onDelete={() => arrayHelpers.remove(index)}
                  />
                </Box>
              </Collapse>
            ))}
          </TransitionGroup>
          <Button
            color="primary"
            variant="outlined"
            data-testid="ecological-unit-button"
            onClick={() => arrayHelpers.push(initialEcologicalUnitValues)}
            startIcon={<Icon path={mdiPlus} size={0.75} />}
            aria-label="Add Ecological Unit"
            disabled={
              // Disable the button if the species is not selected
              Boolean(!values.species) ||
              // Disable the button if the number of ecological units is greater than or equal to the number of available categories
              (ecologicalUnitsDataLoader.data &&
                values.ecological_units.length >= ecologicalUnitsDataLoader.data?.length) ||
              // Disable the button if the data loader is loading
              ecologicalUnitsDataLoader.isLoading
            }
            sx={{ textTransform: 'uppercase' }}>
            Add Ecological Unit
          </Button>
        </>
      )}
    />
  );
};
