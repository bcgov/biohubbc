import { SubcountFormData } from 'features/surveys/observations/form/components/subcounts/subcount/SubcountForm.interface';
import { ObservationSubcountObject } from 'interfaces/useObservationApi.interface';

const getSubcountFormData = (data: ObservationSubcountObject): SubcountFormData => {
  return {
    _id: String(data.observation_subcount_id),
    observation_subcount_id: data.observation_subcount_id,
    subcount: data.subcount,
    comment: data.comment,
    measurements: [
      ...data.quantitative_measurements.map((measurement) => {
        return {
          _id: measurement.critterbase_taxon_measurement_id,
          measurement_id: measurement.critterbase_taxon_measurement_id,
          measurement_value: measurement.value
        };
      }),
      ...data.qualitative_measurements.map((measurement) => {
        return {
          _id: measurement.critterbase_taxon_measurement_id,
          measurement_id: measurement.critterbase_taxon_measurement_id,
          measurement_option_id: measurement.critterbase_measurement_qualitative_option_id
        };
      })
    ],
    markings: []
  };
};

export const getSubcountsFormData = (data: ObservationSubcountObject[]): SubcountFormData[] => {
  return data.map((item) => {
    return getSubcountFormData(item);
  });
};
