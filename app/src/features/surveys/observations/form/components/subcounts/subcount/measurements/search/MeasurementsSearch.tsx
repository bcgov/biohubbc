import green from '@mui/material/colors/green';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { MeasurementsSearchAutocomplete } from 'features/surveys/observations/form/components/subcounts/subcount/measurements/search/MeasurementsSearchAutocomplete';
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
  /**
   * TSNs to retrieve measurements for, if the search needs to be more specified than all focal or observed species
   *
   * @memberof IMeasurementsSearchProps
   */
  tsns?: number[];
  /**
   * TSNs to retrieve measurements for, if the search needs to be more specified than all focal or observed species
   *
   * @memberof IMeasurementsSearchProps
   */
  applicableTsns?: number[];
}

/**
 * Renders an search input to find and add measurements.
 *
 * @param {IMeasurementsSearchProps} props
 * @return {*}
 */
export const MeasurementsSearch = (props: IMeasurementsSearchProps) => {
  const { selectedMeasurements, onAddMeasurementColumn, tsns = [], applicableTsns } = props;

  const critterbaseApi = useCritterbaseApi();

  const measurementsDataLoader = useDataLoader((searchTerm: string, tsns?: number[]) =>
    critterbaseApi.xref.getMeasurementTypeDefinitionsBySearchTerm(searchTerm, tsns)
  );

  // No longer need to fetch observed species or focal species
  const getOptions = async (inputValue: string): Promise<any[]> => {
    const response = await measurementsDataLoader.refresh(inputValue, tsns);
    return response ? [...response.qualitative, ...response.quantitative] : [];
  };

  return (
    <MeasurementsSearchAutocomplete
      selectedOptions={selectedMeasurements}
      ornament={<ColouredRectangleChip label="Applicable" colour={green} />}
      applicableTsns={applicableTsns}
      getOptions={getOptions}
      onAddMeasurementColumn={onAddMeasurementColumn}
    />
  );
};
