import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';

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

/**
 * Defines a single option for a data grid taxonomy autocomplete control.
 *
 * @export
 * @interface IAutocompleteDataGridTaxonomyOption
 * @extends {ITaxonomy}
 * @template ValueType
 */
export interface IAutocompleteDataGridTaxonomyOption<ValueType extends string | number> extends IPartialTaxonomy {
  value: ValueType;
  label: string;
}
