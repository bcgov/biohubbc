import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { WidgetProps } from '@rjsf/core';
import React from 'react';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// Custom type to support this widget
export type AutocompleteMultiSelectOption = { label: string; value: any };

/**
 * A widget that supports a multi-select dropdown field with search filtering.
 *
 * Example schemas:
 *
 * JSON-Schema:
 *
 * ```JSON
 * {
 *   type: 'array',
 *   title: 'Multi Select Field Title',
 *   items: {
 *     type: 'number',
 *     anyOf: [
 *       {
 *         type: 'number',
 *         title: 'Option 1',
 *         enum: [1]
 *       },
 *       {
 *         type: 'number',
 *         title: 'Option 2',
 *         enum: [2]
 *       },
 *       {
 *         type: 'number',
 *         title: 'Option 3',
 *         enum: [3]
 *       }
 *     ]
 *   },
 *   uniqueItems: true
 * }
 * ```
 *
 * uiSchema (assuming you register the widget as `multi-select-autocomplete`:
 *
 * ```JSON
 * {
 *   'ui:widget': 'multi-select-autocomplete'
 * }
 * ```
 *
 * @param {WidgetProps} props standard RJSF widget props
 * @return {*}
 */
const MultiSelectAutocomplete = (props: WidgetProps) => {
  const enumDisabled = props.options.enumDisabled;
  const enumOptions = props.options.enumOptions as AutocompleteMultiSelectOption[];

  /**
   * On a value selected or un-selected, call the parents onChange event to inform the form of the new value of the
   * widget.
   *
   * @param {React.ChangeEvent<{}>} event
   * @param {AutocompleteMultiSelectOption[]} value
   */
  const handleOnChange = (event: React.ChangeEvent<{}>, value: AutocompleteMultiSelectOption[]): void => {
    const newValue: any[] = [];
    value.forEach((item) => newValue.push(item.value));

    props.onChange(newValue);
  };

  /**
   * Custom comparator to determine if a given option is selected.
   *
   * @param {AutocompleteMultiSelectOption} option
   * @param {AutocompleteMultiSelectOption} value
   * @return {*}  {boolean}
   */
  const handleGetOptionSelected = (
    option: AutocompleteMultiSelectOption,
    value: AutocompleteMultiSelectOption
  ): boolean => {
    if (!option?.value || !value?.value) {
      return false;
    }

    return option.value === value.value;
  };

  /**
   * Parses an existing array of values into an array of options.
   *
   * @return {*}  {AutocompleteMultiSelectOption[]}
   */
  const getExistingValue = (): AutocompleteMultiSelectOption[] => {
    if (!props.value) {
      return [];
    }

    return enumOptions.filter((option) => props.value.includes(option.value));
  };

  return (
    <Autocomplete
      multiple
      autoHighlight={true}
      id={props.id}
      value={getExistingValue()}
      getOptionSelected={handleGetOptionSelected}
      disabled={props.disabled}
      options={enumOptions}
      disableCloseOnSelect
      filterOptions={createFilterOptions({ limit: 50 })}
      getOptionLabel={(option) => option.label}
      onChange={handleOnChange}
      renderOption={(option, { selected }) => {
        const disabled: any = enumDisabled && (enumDisabled as any).indexOf(option.value) !== -1;
        return (
          <>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
              disabled={disabled}
              value={option.value}
            />
            {option.label}
          </>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          required={props.required}
          label={props.label || props.schema.title}
          placeholder={'Begin typing to filter results...'}
        />
      )}
    />
  );
};

export default MultiSelectAutocomplete;
