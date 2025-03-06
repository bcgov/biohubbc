import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';

/**
 * Defines a single option for a data grid taxonomy autocomplete control.
 *
 * @export
 * @interface IAutocompleteDataGridTaxonomyOption
 * @extends {IPartialTaxonomy}
 */
export interface IAutocompleteDataGridTaxonomyOption extends IPartialTaxonomy {
  value: number;
  label: string;
}
