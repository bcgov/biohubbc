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
  count: number;
  percentage: number;
  qualitative_measurements: IQualitativeMeasurementGroup[];
  quantitative_measurements: IQuantitativeMeasurementGroup[];
}
