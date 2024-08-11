import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICollectionCategory } from 'interfaces/useCritterApi.interface';
import { useEffect, useMemo } from 'react';
import { EcologicalUnitsOptionSelect } from './EcologicalUnitsOptionSelect';

interface EcologicalUnitsSelectProps {
  categoryFieldName: string;
  unitFieldName: string;
  ecologicalUnits: ICollectionCategory[];
  selectedCategoryIds: string[];
  arrayHelpers: FieldArrayRenderProps;
  index: number;
}

export const EcologicalUnitsSelect = (props: EcologicalUnitsSelectProps) => {
  const { index, ecologicalUnits, arrayHelpers, categoryFieldName, unitFieldName, selectedCategoryIds } = props;
  const { setFieldValue } = useFormikContext();
  const critterbaseApi = useCritterbaseApi();

  const ecologicalUnitOptionsLoader = useDataLoader((categoryId: string) =>
    critterbaseApi.xref.getCollectionUnits(categoryId)
  );

  const selectedCategoryId = selectedCategoryIds[index];

  useEffect(() => {
    if (selectedCategoryId) {
      ecologicalUnitOptionsLoader.refresh(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  // Memoized label for the selected ecological unit
  const selectedCategoryLabel = useMemo(() => {
    return ecologicalUnits.find((unit) => unit.collection_category_id === selectedCategoryId)?.category_name ?? '';
  }, [ecologicalUnits, selectedCategoryId]);

  // Filter out already selected categories
  const availableCategories = useMemo(() => {
    return ecologicalUnits
      .filter(
        (unit) =>
          !selectedCategoryIds.some(
            (existingId) => existingId === unit.collection_category_id && existingId !== selectedCategoryId
          )
      )
      .map((unit) => ({
        value: unit.collection_category_id,
        label: unit.category_name
      }));
  }, [ecologicalUnits, selectedCategoryIds, selectedCategoryId]);

  const ecologicalUnitOptions = useMemo(
    () =>
      ecologicalUnitOptionsLoader.data?.map((unit) => ({
        value: unit.collection_unit_id,
        label: unit.unit_name
      })) ?? [],
    [ecologicalUnitOptionsLoader.data]
  );

  return (
    <Card
      component={Stack}
      variant="outlined"
      flexDirection="row"
      alignItems="flex-start"
      gap={2}
      sx={{ width: '100%', p: 2, backgroundColor: grey[100] }}>
      <AutocompleteField
        id={categoryFieldName}
        name={categoryFieldName}
        label="Ecological Unit"
        options={availableCategories}
        loading={ecologicalUnitOptionsLoader.isLoading}
        onChange={(_, option) => {
          if (option?.value) {
            setFieldValue(categoryFieldName, option.value);
          }
        }}
        required
        sx={{ flex: '1 1 auto' }}
      />
      <EcologicalUnitsOptionSelect name={unitFieldName} options={ecologicalUnitOptions} label={selectedCategoryLabel} />
      <IconButton
        data-testid={`ecological-unit-delete-button-${index}`}
        title="Remove Ecological Unit"
        aria-label="Remove Ecological Unit"
        onClick={() => arrayHelpers.remove(index)}
        sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
