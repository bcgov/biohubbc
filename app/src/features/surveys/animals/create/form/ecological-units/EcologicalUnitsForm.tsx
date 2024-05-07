import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import EcologicalUnitsSelect from './components/EcologicalUnitsSelect';

const initialEcologicalUnitValues = {
  collection_category_id: null,
  collection_unit_id: null
};

/**
 * Returns component for adding ecological units to an animal within the AnimalForm
 *
 * @returns
 *
 */
const EcologicalUnitsForm = () => {
  const { values } = useFormikContext<ICreateEditAnimalRequest>();
  console.log(values)

  return (
    <FieldArray
      name="ecological_units"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          {values.species && values.ecological_units.length > 0 && (
            <Stack mb={3} spacing={1}>
              <EcologicalUnitsSelect species={values.species} arrayHelpers={arrayHelpers} />
            </Stack>
          )}
          <Button
            color="primary"
            variant="outlined"
            data-testid="ecological-unit-button"
            onClick={() => arrayHelpers.push(initialEcologicalUnitValues)}
            startIcon={<Icon path={mdiPlus} size={0.75} />}
            aria-label="Add Ecological Unit"
            disabled={Boolean(!values.species)}
            sx={{ textTransform: 'uppercase' }}>
            Add Ecological Unit
          </Button>
        </>
      )}
    />
  );
};

export default EcologicalUnitsForm;
