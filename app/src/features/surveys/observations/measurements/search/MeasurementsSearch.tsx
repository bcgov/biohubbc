import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MeasurementsSearchAutocomplete from 'features/surveys/observations/measurements/search/MeasurementsSearchAutocomplete';
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
  onSelectOptions: (measurements: CBMeasurementType[]) => void;
}

/**
 * Renders an search input to find and add measurements.
 *
 * @param {IMeasurementsSearchProps} props
 * @return {*}
 */
export const MeasurementsSearch = (props: IMeasurementsSearchProps) => {
  const { selectedMeasurements, onSelectOptions } = props;

  const critterbaseApi = useCritterbaseApi();

  const measurementsDataLoader = useDataLoader(critterbaseApi.lookup.getMeasurementTypeDefinitionsBySearachTerms);

  return (
    <Box>
      <Typography variant="body1" color="textSecondary" sx={{ mt: -1, mb: 3 }}>
        Add additional measurements to your observations data.
      </Typography>
      <MeasurementsSearchAutocomplete
        selectedOptions={selectedMeasurements}
        getOptions={async (inputValue: string) => {
          const searchTerms = inputValue
            .split(' ')
            .map((item) => item.trim())
            .filter(Boolean);
          const response = await measurementsDataLoader.refresh(searchTerms);
          return response || [];
        }}
        onSelectOptions={onSelectOptions}
      />
    </Box>
  );
};
