import {
  CBMeasurementType,
  IQualitativeMeasurementResponse,
  IQuantitativeMeasurementResponse
} from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import { MeasurementsSearch } from './search/MeasurementsSearch';

interface IConfigureMeasurementsProps {
  quantitative: IQuantitativeMeasurementResponse[];
  qualitative: IQualitativeMeasurementResponse[];
}
const ConfigureMeasurements = (props: IConfigureMeasurementsProps) => {
  const [selectedMeasurements, setSelectedMeasurements] = useState<CBMeasurementType[]>();
  //   const survey = useSurveyContext();

  //   const observationsTableContext = useObservationsTableContext();
  console.log(selectedMeasurements);
  console.log(props)

  const onSelectOptions = (measurementsToAdd: CBMeasurementType[]) => {
    setSelectedMeasurements((currentMeasurements) => {
      return (
        currentMeasurements &&
        [...currentMeasurements, ...measurementsToAdd].filter(
          (item1, index, self) =>
            index === self.findIndex((item2) => item2.taxon_measurement_id === item1.taxon_measurement_id)
        )
      );
    });
  };

  return (
    <>
      <MeasurementsSearch selectedMeasurements={[]} onSelectOptions={onSelectOptions} />
      {/* <Stack gap={2}>
        {resourcesDataLoader.data?.measurements?.qualitative.map((measurement) => (
          <MeasurementStandardCard
            label={measurement.measurement_name}
            description={measurement.measurement_desc ?? ''}
            options={measurement.options}
          />
        ))}
        {resourcesDataLoader.data?.measurements?.quantitative.map((measurement) => (
          <MeasurementStandardCard
            label={measurement.measurement_name}
            description={measurement.measurement_desc ?? ''}
          />
        ))}
      </Stack> */}
    </>
  );
};

export default ConfigureMeasurements;
