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
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import EcologicalUnitsOptionSelect from './EcologicalUnitsOptionSelect';

interface IEcologicalUnitsSelect {
  arrayHelpers: FieldArrayRenderProps;
  species: ITaxonomy | null;
}

/**
 * Returns a component for selecting ecological (ie. collection) units for a given species
 *
 * @param props
 * @returns
 */
const EcologicalUnitsSelect = (props: IEcologicalUnitsSelect) => {
  const critterbaseApi = useCritterbaseApi();

  const { values, setFieldValue } = useFormikContext<ICreateEditAnimalRequest>();

  const ecologicalUnitsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getCollectionUnits(tsn));

  if (!ecologicalUnitsDataLoader.data) {
    if (values.species?.tsn) {
      ecologicalUnitsDataLoader.load(values.species.tsn);
    }
  }

  // TODO: Update critterbase to send options with each unit
  const units = ecologicalUnitsDataLoader.data;

  return (
    <Stack spacing={2}>
      {values.ecological_units.map((unit, index) => {
        return (
          <Collapse in={Boolean(values.species)} role="listitem" key={`${unit.collection_category_id}-${index}`}>
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
                id={`ecological_units.[${index}].collection_category_id`}
                name={`ecological_units.[${index}].collection_category_id`}
                label="Ecological Unit"
                options={
                  units?.map((option) => ({
                    value: option.collection_category_id,
                    label: option.category_name
                  })) ?? []
                }
                loading={ecologicalUnitsDataLoader.isLoading}
                onChange={(_, option) => {
                  if (option?.value) {
                    setFieldValue(`ecological_units.[${index}].collection_category_id`, option.value);
                  }
                }}
                required
                sx={{
                  flex: '1 1 auto'
                }}
              />
              <EcologicalUnitsOptionSelect
                index={index}
                collection_category_id={values.ecological_units[index].collection_category_id ?? ''}
                unit_label={
                  ecologicalUnitsDataLoader.data?.find(
                    (unit) => unit.collection_category_id === values.ecological_units[index].collection_category_id
                  )?.category_name ?? ''
                }
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
        );
      })}
    </Stack>
  );
};

export default EcologicalUnitsSelect;
