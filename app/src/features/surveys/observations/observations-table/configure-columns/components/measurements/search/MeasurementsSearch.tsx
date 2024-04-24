import { MeasurementsSearchAutocomplete } from 'features/surveys/observations/observations-table/configure-columns/components/measurements/search/MeasurementsSearchAutocomplete';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';

export interface IMeasurementsSearchProps {
  /**
   * The selected measurements.
   *
   * @type {CBMeasurementType[]}
   * @memberof IMeasurementsSearchProps
   */
  selectedMeasurements: CBMeasurementType[];
  /**
   * Callback fired on select options.
   *
   * @memberof IMeasurementsSearchProps
   */
  onAddMeasurementColumn: (measurementColumn: CBMeasurementType) => void;
}

/**
 * Renders an search input to find and add measurements.
 *
 * @param {IMeasurementsSearchProps} props
 * @return {*}
 */
export const MeasurementsSearch = (props: IMeasurementsSearchProps) => {
  const { selectedMeasurements, onAddMeasurementColumn } = props;

  const critterbaseApi = useCritterbaseApi();

  const measurementsDataLoader = useDataLoader(critterbaseApi.xref.getMeasurementTypeDefinitionsBySearchTerm);

  return (
    <MeasurementsSearchAutocomplete
      selectedOptions={selectedMeasurements}
      getOptions={async (inputValue: string) => {
        const response = await measurementsDataLoader.refresh(inputValue);
        return (response && [...response.qualitative, ...response.quantitative]) || [];
      }}
      onAddMeasurementColumn={onAddMeasurementColumn}
    />
  );
};
