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
import { ICollectionCategory, ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import { useMemo, useState } from 'react';
import { EcologicalUnitsOptionSelect } from './EcologicalUnitsOptionSelect';

interface IEcologicalUnitsSelect {
  // The collection units (categories) available to select from
  ecologicalUnits: ICollectionCategory[];
  // Formik field array helpers
  arrayHelpers: FieldArrayRenderProps;
  // The index of the field array for these controls
  index: number;
}

/**
 * Returns a component for selecting ecological (ie. collection) units for a given species.
 *
 * @param {IEcologicalUnitsSelect} props
 * @return {*}
 */
export const EcologicalUnitsSelect = (props: IEcologicalUnitsSelect) => {
  const { index, ecologicalUnits } = props;

  const { values, setFieldValue } = useFormikContext<ICreateEditAnimalRequest>();

  const critterbaseApi = useCritterbaseApi();

  // Get the collection category ID for the selected ecological unit
  const selectedEcologicalUnitId: string | undefined = values.ecological_units[index]?.collection_category_id;

  const ecologicalUnitOptionDataLoader = useDataLoader((collection_category_id: string) =>
    critterbaseApi.xref.getCollectionUnits(collection_category_id)
  );

  if (selectedEcologicalUnitId) {
    // If a collection category is already selected, load the collection units for that category
    ecologicalUnitOptionDataLoader.load(selectedEcologicalUnitId);
  }

  // Set the label for the ecological unit options autocomplete field
  const [ecologicalUnitOptionLabel, setEcologicalUnitOptionLabel] = useState<string>(
    ecologicalUnits.find((ecologicalUnit) => ecologicalUnit.collection_category_id === selectedEcologicalUnitId)
      ?.category_name ?? ''
  );

  // Filter out the categories that are already selected so they can't be selected again
  const filteredCategories = useMemo(
    () =>
      ecologicalUnits
        .filter(
          (ecologicalUnit) =>
            !values.ecological_units.some(
              (existing) =>
                existing.collection_category_id === ecologicalUnit.collection_category_id &&
                existing.collection_category_id !== selectedEcologicalUnitId
            )
        )
        .map((option) => {
          return {
            value: option.collection_category_id,
            label: option.category_name
          };
        }) ?? [],
    [ecologicalUnits, selectedEcologicalUnitId, values.ecological_units]
  );

  // Map the collection unit options to the format required by the AutocompleteField
  const ecologicalUnitOptions = useMemo(
    () =>
      ecologicalUnitOptionDataLoader.data?.map((option) => ({
        value: option.collection_unit_id,
        label: option.unit_name
      })) ?? [],
    [ecologicalUnitOptionDataLoader.data]
  );

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
          options={filteredCategories}
          loading={ecologicalUnitOptionDataLoader.isLoading}
          onChange={(_, option) => {
            if (option?.value) {
              setFieldValue(`ecological_units.[${index}].collection_category_id`, option.value);
              setEcologicalUnitOptionLabel(option.label);
            }
          }}
          required
          sx={{
            flex: '1 1 auto'
          }}
        />
        <EcologicalUnitsOptionSelect index={index} options={ecologicalUnitOptions} label={ecologicalUnitOptionLabel} />
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
