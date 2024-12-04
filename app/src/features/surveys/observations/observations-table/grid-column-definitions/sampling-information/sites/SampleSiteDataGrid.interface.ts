import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';

/**
 * Defines a single option for a data grid taxonomy autocomplete control.
 *
 * @export
 * @interface IAutocompleteDataGridSampleSiteOption
 * @extends {IPartialSampleSite}
 */
export interface IAutocompleteDataGridSampleSiteOption extends IGetSampleLocationNonSpatialDetails {
  value: number;
  label: string;
}
