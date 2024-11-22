import { IGetSampleMethodDetails } from 'interfaces/useSamplingSiteApi.interface';

export interface IAutocompleteDataGridSampleMethodOption extends IGetSampleMethodDetails {
  value: number;
  label: string;
}
