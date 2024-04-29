import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICollectionUnitResponse, ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';

type ICollectionUnitResponseWithOptions = ICollectionUnitResponse & { options: ICollectionUnitOption[] };

interface ICollectionUnitOption {
  id: string;
  name: string;
}
interface IEcologicalUnitsSelect {
  arrayHelpers: FieldArrayRenderProps;
  species: ITaxonomy | null;
}

const EcologicalUnitsSelect = (props: IEcologicalUnitsSelect) => {
  const critterbaseApi = useCritterbaseApi();
  // console.log(props);
  const { values } = useFormikContext<ICreateEditAnimalRequest>();

  const ecologicalUnitsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getCollectionUnits(tsn));

  if (!ecologicalUnitsDataLoader.data) {
    if (values.species?.tsn) {
      ecologicalUnitsDataLoader.load(values.species.tsn);
    }
  }

  // PLACEHOLDER TYPE
  let units = ecologicalUnitsDataLoader.data as ICollectionUnitResponseWithOptions[];

  // PLACEHOLDER UNTIL THE CRITTERBASE RESPONSE INCLUDES AN ARRAY OF OPTIONS
  units = units?.map((unit) => ({
    ...unit,
    options: [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
      { id: '3', name: 'C' }
    ] as ICollectionUnitOption[]
  }));

  console.log(units);

  return (
    <>
      <Stack spacing={2}>
        {values.ecological_units.map((_, index) => (
          <Collapse in={Boolean(values.species)} role="listitem" key={index}>
            <Card
              component={Stack}
              variant="outlined"
              flexDirection="row"
              alignItems="flex-start"
              gap={2}
              sx={{
                width: '100%',
                p: 2,
                backgroundColor: grey[100]
              }}>
              <AutocompleteField
                id={`ecological_units.[${index}].ecological_unit_id`}
                name={`ecological_units.[${index}].ecological_unit_id`}
                label="Ecological Unit"
                options={
                  units?.map((option) => ({
                    value: option.collection_category_id,
                    label: option.category_name
                  })) ?? []
                }
                loading={ecologicalUnitsDataLoader.isLoading}
                required
                sx={{
                  flex: '1 1 auto'
                }}
              />
              <AutocompleteField
                id={`ecological_units.[${index}].value`}
                name={`ecological_units.[${index}].value`}
                label={
                  units?.find(
                    (unit) => unit.collection_category_id === values.ecological_units[index].ecological_unit_id
                  )?.category_name ?? ''
                } // Need to get codes for displaying name
                options={
                  units
                    ?.find(
                      (option) => option.collection_category_id === values.ecological_units[index].ecological_unit_id
                    )
                    ?.options.map((option) => ({
                      value: option.id,
                      label: option.name
                    })) ?? []
                }
                disabled={Boolean(!values.ecological_units[index].ecological_unit_id)}
                required
                sx={{
                  flex: '1 1 auto'
                }}
              />

              <IconButton
                data-testid={`ecological-unit-delete-button-${index}`}
                title="Remove Ecological Unit"
                aria-label="Remove Ecological Unit"
                onClick={() => props.arrayHelpers.remove(index)}
                sx={{ mt: 1.125 }}>
                <Icon path={mdiClose} size={1} />
              </IconButton>
            </Card>
          </Collapse>
        ))}
      </Stack>
    </>
  );
};

export default EcologicalUnitsSelect;
