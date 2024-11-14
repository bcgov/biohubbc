import { IGetSamplePeriodRecord } from 'interfaces/useSamplingSiteApi.interface';

export interface IAutocompleteDataGridSamplePeriodOption extends IGetSamplePeriodRecord {
  value: number;
  label: string;
}
