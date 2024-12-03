import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import { DualAutocompleteUnitField } from 'components/fields/dual-autocomplete-field/components/DualAutocompleteUnitField';
import { useFormikContext } from 'formik';
import { get } from 'lodash';
import { useMemo, useState } from 'react';

/**
 * A generic component for rendering two autocomplete fields that are interdependent (category -> unit).
 * @param props The component props.
 */
interface IDualAutocompleteFieldProps<TCategory extends string | number, TUnit extends string | number> {
  /**
   * Label to display for the category field.
   */
  categoryLabel: string;
  /**
   * The options to display in the category field.
   */
  categoryOptions: { label: string; value: TCategory }[];
  /**
   * The formik field name for the category field.
   */
  categoryFormikFieldName: string;
  /**
   * Callback to get the data type of the category field.
   *
   * If not provided, the default data type will be 'quantitative'.
   */
  getCategoryDataType?: (categoryId: TCategory) => 'quantitative' | 'qualitative';
  /**
   * Callback to get the options to display in the unit field, based on the selected category. Only called when a
   * category is selected and the category data type is qualitative.
   */
  getUnitOptions: (categoryId: TCategory) => { label: string; value: TUnit }[];
  /**
   * The options to display in the unit field, based on the selected category.
   *
   * If not provided, the default label for the unit field will be "Value".
   */
  getUnitAutocompleteLabel?: (categoryId: TCategory) => string;
  /**
   * Get the formik field name for the unit field.
   */
  getUnitFormikFieldName: (categoryId: TCategory) => string;
  /**
   * Callback fired when the delete button is clicked.
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
    categoryLabel,
    categoryOptions,
    categoryFormikFieldName,
    getCategoryDataType,
    getUnitOptions,
    getUnitAutocompleteLabel,
    getUnitFormikFieldName,
    onDelete
  } = props;
  const { values, setFieldValue } = useFormikContext<any>();

  const categoryId: TCategory | null = get(values, categoryFormikFieldName);

  // The category data type (quantitative or qualitative)
  const categoryDataType = getCategoryDataType ? getCategoryDataType(categoryId as TCategory) : 'quantitative';

  // The label units field, which defaults to "Value" unless set with the getUnitAutocompleteLabel prop
  const [unitLabel, setUnitLabel] = useState<string>('Value');

  // The array of options for the unit field, if the category measurement type is qualitative.
  const unitOptions = useMemo(() => {
    if (!categoryId) {
      // No category selected, so no units to display
      return [];
    }

    const availableUnits = getUnitOptions(categoryId);

    // Update the label of the second dropdown if a custom label is provided
    if (getUnitAutocompleteLabel) {
      const label = getUnitAutocompleteLabel(categoryId);
      setUnitLabel(label);
    }

    return availableUnits;
  }, [categoryId, getUnitAutocompleteLabel, getUnitOptions]);

  // The formik field name for the unit field
  const unitFormikFieldName = categoryId ? getUnitFormikFieldName(categoryId) : 'value';

  return (
    <Card
      component={Stack}
      variant="outlined"
      flexDirection="row"
      alignItems="flex-start"
      gap={2}
      sx={{ width: '100%', p: 2, backgroundColor: grey[100] }}>
      <AutocompleteField
        id={categoryFormikFieldName}
        name={categoryFormikFieldName}
        label={categoryLabel}
        options={categoryOptions}
        showValue
        required
        onChange={(_, option) => {
          if (!option) {
            // If the category value is cleared, clear the dependent unit value as well
            setFieldValue(unitFormikFieldName, undefined);
            setUnitLabel('Select a unit');
            return;
          }

          // Set the category value
          setFieldValue(categoryFormikFieldName, option.value);
        }}
        sx={{ flex: 0.5 }}
      />

      <DualAutocompleteUnitField
        unitLabel={unitLabel}
        unitOptions={unitOptions}
        categoryDataType={categoryDataType}
        unitFormikFieldName={unitFormikFieldName}
      />

      <IconButton data-testid="delete-button" title="Remove" aria-label="Remove" onClick={onDelete} sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
