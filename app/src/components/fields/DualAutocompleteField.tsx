import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { get } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

/**
 * A generic component for rendering two autocomplete fields that are interdependent (category -> unit).
 * @param props The component props.
 */
interface IDualAutocompleteFieldProps<TCategory extends string | number, TUnit extends string | number> {
  /**
   * The categories data to display in the first autocomplete field.
   */
  categoryOptions: { value: TCategory; label: string }[];

  /**
   * The units data to display in the second autocomplete field, based on the selected category.
   */
  getUnitOptions: (categoryId: TCategory) => { value: TUnit; label: string }[];

  /**
   * The field name for the category in Formik.
   */
  formikCategoryFieldName: string;

  /**
   * The field name for the unit in Formik.
   */
  formikUnitFieldName: string;

  /**
   * Callback for when the delete button is clicked.
   */
  onDelete: () => void;

  /**
   * Optionally filter out certain categories and units.
   */
  filterCategoryIds?: TCategory[];
  filterUnitIds?: TUnit[];
}

export const DualAutocompleteField = <TCategory extends string | number, TUnit extends string | number>(
  props: IDualAutocompleteFieldProps<TCategory, TUnit>
) => {
  const {
    categoryOptions,
    getUnitOptions,
    filterCategoryIds,
    filterUnitIds,
    formikCategoryFieldName,
    formikUnitFieldName,
    onDelete
  } = props;
  const formik = useFormikContext<any>();

  // State for the label of the unit field
  const [unitLabel, setUnitLabel] = useState<string>('Select a unit');

  // Get the selected category and unit from Formik values
  const categoryId: TCategory | null = get(formik.values, formikCategoryFieldName)
  //   const unitId: TUnit | null = formik.values[formikUnitFieldName];

  // Filter category options based on the filterCategoryIds
  const filteredCategories = useMemo(() => {
    const filterCategoryIdsSet = new Set(filterCategoryIds ?? []);
    return categoryOptions.filter((category) => !filterCategoryIdsSet.has(category.value));
  }, []);

  const availableUnits = categoryId ? getUnitOptions(categoryId) : [];

  console.log(categoryId, availableUnits, 'available')

  // Filter unit options based on the selected category and filterUnitIds
  const filteredUnits = useMemo(() => {
    if (!categoryId) return [];
    const filterUnitIdsSet = new Set(filterUnitIds ?? []);
    console.log('triggered')
    return availableUnits.filter((unit) => !filterUnitIdsSet.has(unit.value));
  }, [getUnitOptions]);

  useEffect(() => {
    if (!categoryId) {
      setUnitLabel('Select a unit');
    } else {
      setUnitLabel('Select a specific unit');
    }
  }, [categoryId]);

  console.log(filteredUnits, filteredCategories);

  // console.log(get(formik.values, formikCategoryFieldName))
  // console.log(filteredCategories)

  return (
    <Card
      component={Stack}
      variant="outlined"
      flexDirection="row"
      alignItems="flex-start"
      gap={2}
      sx={{ width: '100%', p: 2, backgroundColor: grey[100] }}>
      <AutocompleteField
        id={formikCategoryFieldName}
        name={formikCategoryFieldName}
        label="Category"
        options={filteredCategories}
        onChange={(_, option) => {
          if (!option) {
            formik.setFieldValue(formikUnitFieldName, undefined);
            setUnitLabel('Select a unit');
            return;
          }
          formik.setFieldValue(formikCategoryFieldName, option.value);
        }}
        required
        sx={{ flex: '1 1 auto' }}
      />

      <AutocompleteField
        id={formikUnitFieldName}
        name={formikUnitFieldName}
        label={unitLabel}
        options={filteredUnits}
        onChange={(_, option) => {
          formik.setFieldValue(formikUnitFieldName, option?.value ?? undefined);
        }}
        required
        disabled={filteredUnits.length === 0}
        sx={{ flex: '1 1 auto' }}
      />

      <IconButton data-testid="delete-button" title="Remove" aria-label="Remove" onClick={onDelete} sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
