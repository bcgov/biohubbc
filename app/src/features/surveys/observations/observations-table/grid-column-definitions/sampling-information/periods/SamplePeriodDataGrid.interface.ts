import { IGetSamplePeriodRecord } from 'interfaces/usePeriodApi.interface';

export interface IAutocompleteDataGridSamplePeriodOption extends IGetSamplePeriodRecord {
  value: number;
  label: string;
}
