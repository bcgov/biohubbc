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
  selectedCategories: { critterbase_collection_category_id: string; critterbase_collection_unit_id: string | null }[];
  arrayHelpers: FieldArrayRenderProps;
  index: number;
  /**
   * Whether to allow for multiple ecological units of the same category to be selected; eg. if distinct is true, cannot
   * select two population units. If distinct is false, multiple units can be selected for the "population unit" category.
   *
   */
  distinct?: boolean;
}

/**
 * Returns a pair of autocomplete fields for selecting an ecological unit category and value for the category.
 *
 * @param props {IEcologicalUnitsSelectProps}
 * @returns
 */
export const EcologicalUnitsSelect = (props: EcologicalUnitsSelectProps) => {
  const { index, ecologicalUnits, arrayHelpers, categoryFieldName, unitFieldName, selectedCategories, distinct } =
    props;
  const { setFieldValue } = useFormikContext();
  const critterbaseApi = useCritterbaseApi();

  const ecologicalUnitOptionsLoader = useDataLoader((categoryId: string) =>
    critterbaseApi.xref.getCollectionUnits(categoryId)
  );

  const selectedCategory = selectedCategories[index]?.critterbase_collection_category_id;
  const selectedUnit = selectedCategories[index]?.critterbase_collection_unit_id;

  useEffect(() => {
    if (selectedCategory) {
      ecologicalUnitOptionsLoader.refresh(selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Memoized label for the selected ecological unit
  const selectedCategoryLabel = useMemo(() => {
    return ecologicalUnits.find((unit) => unit.collection_category_id === selectedCategory)?.category_name ?? '';
  }, [ecologicalUnits, selectedCategory]);

  // Filter out already selected categories
  const availableCategories = useMemo(() => {
    if (!distinct) {
      return ecologicalUnits.map((unit) => ({
        value: unit.collection_category_id,
        label: unit.category_name
      }));
    }

    const selectedCategoriesSet = new Set(selectedCategories.map((id) => id.critterbase_collection_category_id));

    return ecologicalUnits
      .filter(
        (unit) =>
          !selectedCategoriesSet.has(unit.collection_category_id) || unit.collection_category_id === selectedCategory
      )
      .map((unit) => ({
        value: unit.collection_category_id,
        label: unit.category_name
      }));
  }, [ecologicalUnits, selectedCategories, selectedCategory, distinct]);

  // Filter out already selected units
  const ecologicalUnitOptions = useMemo(() => {
    const allOptions =
      ecologicalUnitOptionsLoader.data?.map((unit) => ({
        value: unit.collection_unit_id,
        label: unit.unit_name
      })) ?? [];

    // Create a Set for faster lookup of selected ecological unit IDs
    const selectedUnitIdsSet = new Set(selectedCategories.map((category) => category.critterbase_collection_unit_id));

    // Filter out selected units
    return allOptions.filter((unit) => !selectedUnitIdsSet.has(unit.value) || unit.value === selectedUnit);
  }, [ecologicalUnitOptionsLoader.data, selectedCategories, selectedUnit]);

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
