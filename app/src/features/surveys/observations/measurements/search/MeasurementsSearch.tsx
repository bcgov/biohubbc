import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MeasurementsSearchAutocomplete from 'features/surveys/observations/measurements/search/MeasurementsSearchAutocomplete';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';

export interface IMeasurementsSearchProps {
  /**
   * The selected measurements.
   *
   * @type {Measurement[]}
   * @memberof IMeasurementsSearchProps
   */
  selectedMeasurements: Measurement[];
  /**
   * Callback fired on select options.
   *
   * @memberof IMeasurementsSearchProps
   */
  onSelectOptions: (measurements: Measurement[]) => void;
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

  const measurementsDataLoader = useDataLoader(critterbaseApi.lookup.getMeasurementsBySearachTerms);

  return (
    <Box p={0}>
      <Typography component="legend">Find and add measurements</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mt: -1, mb: 3 }}>
        Customize the observation columns by adding one or more measurements.
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
