import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';

export interface IAutocompleteDataGridSamplePeriodOption extends GetSamplingPeriod {
  value: number;
  label: string;
}
