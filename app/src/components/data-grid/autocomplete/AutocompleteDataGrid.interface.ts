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
}

/**
 * Defines a single option for a data grid taxonomy autocomplete control.
 *
 * @export
 * @interface IAutocompleteDataGridTaxonomyOption
 * @template ValueType
 */
export interface IAutocompleteDataGridTaxonomyOption<ValueType extends string | number> {
  value: ValueType;
  label: string;
  commonNames: string[];
  tsn: number;
  rank: string;
  kingdom: string;
}
