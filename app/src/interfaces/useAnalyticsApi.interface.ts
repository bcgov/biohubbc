interface IQualitativeMeasurementGroup {
  option: {
    option_id: string;
    option_label: string;
  };
  taxon_measurement_id: string;
  measurement_name: string;
}

interface IQuantitativeMeasurementGroup {
  value: number;
  taxon_measurement_id: string;
  measurement_name: string;
}

export interface IObservationCountByGroup {
  row_count: number;
  individual_count: number;
  individual_percentage: number;
  itis_tsn?: number;
  date?: string;
  survey_sample_site_id?: number;
  survey_sample_method_id?: number;
  survey_sample_period_id?: number;
  qualitative_measurements: IQualitativeMeasurementGroup[];
  quantitative_measurements: IQuantitativeMeasurementGroup[];
}
