import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { get } from 'lodash';
import { useMemo, useState } from 'react';

/**
 * A generic component for rendering two autocomplete fields that are interdependent (category -> unit).
 * @param props The component props.
 */
interface IDualAutocompleteFieldProps<TCategory extends string | number, TUnit extends string | number> {
  /**
   * Label to display for the first autocomplete
   */
  label: string;

  /**
   * The categories data to display in the FIRST autocomplete field.
   */
  categoryOptions: { value: TCategory; label: string }[];

  /**
   * The units data to display in the SECOND autocomplete field, based on the selected category.
   */
  getUnitOptions: (categoryId: TCategory) => { value: TUnit; label: string }[];

  /**
   * The units data to display in the SECOND autocomplete field, based on the selected category.
   */
  getUnitAutocompleteLabel?: (categoryId: TCategory) => string;

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
}

/**
 * Returns two autocomplete fields where the values for the second dropdown depend on the value of the first dropdown.
 * In this component, CATEGORY refers to the first dropdown and UNIT refers to the second dropdown.
 *
 * @param {IDualAutocompleteFieldProps<TCategory, TUnit>}props
 * @returns
 */
export const DualAutocompleteField = <TCategory extends string | number, TUnit extends string | number>(
  props: IDualAutocompleteFieldProps<TCategory, TUnit>
) => {
  const {
    categoryOptions,
    getUnitOptions,
    getUnitAutocompleteLabel,
    label,
    formikCategoryFieldName,
    formikUnitFieldName,
    onDelete
  } = props;
  const formik = useFormikContext<any>();

  // The label of the second dropdown, which defaults to "Value" unless set with the getUnitAutocompleteLabel prop
  const [unitLabel, setUnitLabel] = useState<string>('Value');

  const categoryId: TCategory | null = get(formik.values, formikCategoryFieldName);

  // Filter units based on the selected category and exclude already selected units (if any)
  const filteredUnits = useMemo(() => {
    if (!categoryId) return [];

    const availableUnits = getUnitOptions(categoryId);

    // Update the label of the second dropdown if a custom label is provided
    if (getUnitAutocompleteLabel) {
      const label = getUnitAutocompleteLabel(categoryId);
      setUnitLabel(label);
    }

    return availableUnits;
  }, [categoryId, getUnitAutocompleteLabel, getUnitOptions]);

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
        label={label}
        options={categoryOptions}
        showValue
        onChange={(_, option) => {
          if (!option) {
            formik.setFieldValue(formikUnitFieldName, undefined);
            setUnitLabel('Select a unit');
            return;
          }
          formik.setFieldValue(formikCategoryFieldName, option.value);
        }}
        required
        sx={{ flex: 0.5 }}
      />

      <AutocompleteField
        id={formikUnitFieldName}
        name={formikUnitFieldName}
        label={unitLabel}
        options={filteredUnits}
        showValue
        onChange={(_, option) => {
          formik.setFieldValue(formikUnitFieldName, option?.value ?? undefined);
        }}
        required
        sx={{ flex: 0.5 }}
      />

      <IconButton data-testid="delete-button" title="Remove" aria-label="Remove" onClick={onDelete} sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
