import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MeasurementsSearchAutocomplete from 'features/surveys/observations/observation-measurements/search/MeasurementsSearchAutocomplete';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';

export interface IMeasurementsSearchProps {
  selectedMeasurements: Measurement[];
  onChange: (measurements: Measurement[]) => void;
}

export const MeasurementsSearch = (props: IMeasurementsSearchProps) => {
  const { selectedMeasurements, onChange } = props;

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
        onSelectOptions={onChange}
      />
    </Box>
  );
};
