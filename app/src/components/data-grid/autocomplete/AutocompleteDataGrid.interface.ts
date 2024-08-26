/**
 * Defines a single option for a data grid autocomplete control.
 *
 * @export
 * @interface IAutocompleteDataGridOption
 * @template ValueType
 */
export interface IAutocompleteDataGridOption<ValueType extends string | number> {
  value: ValueType;
  label: string;
  subtext?: string;
}
