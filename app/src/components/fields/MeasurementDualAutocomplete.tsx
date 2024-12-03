import { DualAutocompleteField } from 'components/fields/dual-autocomplete-field/DualAutocompleteField';
import { useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';

interface IMeasurementDualAutocompleteProps {
  tsn: number;
  formikCategoryFieldName: string;
  getFormikUnitFieldName: (type: string) => string;
  onDelete: () => void;
}

export const MeasurementDualAutocomplete = ({
  tsn,
  formikCategoryFieldName,
  getFormikUnitFieldName,
  onDelete
}: IMeasurementDualAutocompleteProps) => {
  const critterbaseApi = useCritterbaseApi();
  const { values } = useFormikContext();

  const measurementsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getTaxonMeasurements(tsn));

  useEffect(() => {
    if (tsn) {
      measurementsDataLoader.load(tsn);
    }
  }, [measurementsDataLoader, tsn, values]);

  const measurements = measurementsDataLoader.data ?? { quantitative: [], qualitative: [] };

  return (
    <DualAutocompleteField
      categoryLabel="Measurement"
      categoryOptions={[
        ...(measurements?.quantitative ?? []).map((item) => ({
          value: item.taxon_measurement_id,
          label: item.measurement_name
        })),
        ...(measurements?.qualitative ?? []).map((item) => ({
          value: item.taxon_measurement_id,
          label: item.measurement_name
        }))
      ]}
      categoryFormikFieldName={formikCategoryFieldName}
      getCategoryDataType={(categoryId) => {
        const measurement = measurements?.qualitative.find((item) => item.taxon_measurement_id === categoryId);
        return measurement ? 'qualitative' : 'quantitative';
      }}
      getUnitOptions={(categoryId) => {
        const measurement = measurements?.qualitative.find((item) => item.taxon_measurement_id === categoryId);
        return (
          measurement?.options.map((option) => ({
            value: option.option_value,
            label: option.option_label
          })) ?? []
        );
      }}
      getUnitAutocompleteLabel={(categoryId) => {
        const measurement = [...(measurements?.qualitative ?? []), ...(measurements?.quantitative ?? [])].find(
          (item) => item.taxon_measurement_id === categoryId
        );
        return measurement?.measurement_name ?? 'Unit';
      }}
      getUnitFormikFieldName={getFormikUnitFieldName}
      onDelete={onDelete}
    />
  );
};
