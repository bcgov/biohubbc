import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import { useEffect } from 'react';
import { v4 } from 'uuid';
import EcologicalUnitsSelect from './components/EcologicalUnitsSelect';

const initialEcologicalUnitValues = {
  key: v4(),
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
  const critterbaseApi = useCritterbaseApi();

  const ecologicalUnitsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getCollectionUnits(tsn));

  useEffect(() => {
    // Maybe add something to prevent refreshes. Refresh ONLY when species changes?
    if (values.species?.tsn) {
      ecologicalUnitsDataLoader.refresh(values.species.tsn);
    }
  }, [values.species]);

  return (
    <FieldArray
      name="ecological_units"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <Stack mb={3} spacing={1}>
            {values.species?.tsn &&
              values.ecological_units.map((unit, index) => (
                <EcologicalUnitsSelect
                  key={`${unit.collection_unit_id}-${index}`}
                  units={ecologicalUnitsDataLoader.data ?? []}
                  species={values.species}
                  arrayHelpers={arrayHelpers}
                  index={index}
                />
              ))}
          </Stack>
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
