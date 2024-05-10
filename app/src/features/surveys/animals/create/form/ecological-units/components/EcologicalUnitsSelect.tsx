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
import { useState } from 'react';
import EcologicalUnitsOptionSelect from './EcologicalUnitsOptionSelect';

interface IEcologicalUnitsSelect {
  units: ICollectionUnitResponse[];
  arrayHelpers: FieldArrayRenderProps;
  species: ITaxonomy | null;
  index: number;
}

/**
 * Returns a component for selecting ecological (ie. collection) units for a given species
 *
 * @param props
 * @returns
 */
const EcologicalUnitsSelect = (props: IEcologicalUnitsSelect) => {
  const { index, units } = props;
  const critterbaseApi = useCritterbaseApi();
  const [ecologicalUnitOptionLabel, setEcologicalUnitOptionLabel] = useState<string>('');

  const { values, setFieldValue } = useFormikContext<ICreateEditAnimalRequest>();

  const ecologicalUnitOptionDataLoader = useDataLoader((collection_category_id: string) =>
    critterbaseApi.xref.getCollectionUnitOptions(collection_category_id)
  );

  const options =
    ecologicalUnitOptionDataLoader.data?.map((option) => ({
      value: option.collection_unit_id,
      label: option.unit_name
    })) ?? [];

  return (
    <Collapse in={Boolean(values.species)} role="listitem">
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
            units
              ?.filter(
                (item) =>
                  !values.ecological_units.some(
                    (existing) =>
                      existing.collection_category_id === item.collection_category_id &&
                      existing.collection_category_id !== values.ecological_units[index].collection_category_id
                  )
              )
              .map((option) => {
                console.log(option);
                return {
                  value: option.collection_category_id,
                  label: option.category_name
                };
              }) ?? []
          }
          loading={ecologicalUnitOptionDataLoader.isLoading}
          onChange={(_, option) => {
            console.log(option?.label);
            if (option?.value) {
              setFieldValue(`ecological_units.[${index}].collection_category_id`, option.value);
              setEcologicalUnitOptionLabel(option.label);
              ecologicalUnitOptionDataLoader.refresh(option.value);
            }
          }}
          required
          sx={{
            flex: '1 1 auto'
          }}
        />
        <EcologicalUnitsOptionSelect index={index} options={options} label={ecologicalUnitOptionLabel} />
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
};

export default EcologicalUnitsSelect;
