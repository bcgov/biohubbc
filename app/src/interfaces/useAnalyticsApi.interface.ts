interface IQualitativeMeasurementGroup {
  taxon_measurement_id: string;
  measurement_name: string;
  option: {
    option_id: string;
    option_label: string;
  };
}

interface IQuantitativeMeasurementGroup {
  taxon_measurement_id: string;
  measurement_name: string;
  value: number;
}

export interface IObservationCountByGroup {
  /**
   * Randomly generated unique ID for the group.
   */
  id: string;
  row_count: number;
  individual_count: number;
  individual_percentage: number;
  itis_tsn?: number;
  observation_date?: string;
  survey_sample_site_id?: number;
  survey_sample_method_id?: number;
  survey_sample_period_id?: number;
  qualitative_measurements: IQualitativeMeasurementGroup[];
  quantitative_measurements: IQuantitativeMeasurementGroup[];
}
