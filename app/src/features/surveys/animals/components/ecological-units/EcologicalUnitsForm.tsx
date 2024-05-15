import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { EcologicalUnitsSelect } from 'features/surveys/animals/components/ecological-units/components/EcologicalUnitsSelect';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import { useEffect } from 'react';

const initialEcologicalUnitValues = {
  collection_category_id: null,
  collection_unit_id: null
};

/**
 * Returns component for adding ecological units to an animal within the AnimalFormContainer.
 *
 * @returns
 */
export const EcologicalUnitsForm = () => {
  const { values, errors } = useFormikContext<ICreateEditAnimalRequest>();

  console.log(errors);
  console.log(values);

  const critterbaseApi = useCritterbaseApi();

  const ecologicalUnitsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getCollectionCategories(tsn));

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
          {values.ecological_units.length > 0 && (
            <Stack mb={3} spacing={1}>
              {values.ecological_units.map((ecological_unit, index) => (
                <EcologicalUnitsSelect
                  key={ecological_unit.collection_category_id ?? index}
                  ecologicalUnits={ecologicalUnitsDataLoader.data ?? []}
                  arrayHelpers={arrayHelpers}
                  index={index}
                />
              ))}
            </Stack>
          )}
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
