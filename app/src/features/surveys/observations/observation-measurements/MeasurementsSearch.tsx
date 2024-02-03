import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MeasurementsSearchAutocomplete from 'features/surveys/observations/observation-measurements/MeasurementsSearchAutocomplete';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';

export interface IMeasurementsSearchProps {
  measurements: Measurement[];
  onChange: (measurements: Measurement[]) => void;
}

export const MeasurementsSearch = (props: IMeasurementsSearchProps) => {
  const { measurements, onChange } = props;

  const critterbaseApi = useCritterbaseApi();

  const measurementsDataLoader = useDataLoader(critterbaseApi.lookup.getMeasurementsBySearachTerms);

  return (
    <Box p={3}>
      <Typography component="dt" variant="body1" color="textSecondary">
        Find and add measurements
      </Typography>
      <MeasurementsSearchAutocomplete
        selectedOptions={measurements}
        getOptions={async (inputValue: string) => {
          const searchTerms = inputValue
            .split(' ')
            .map((item) => item.trim())
            .filter(Boolean);
          const response = await measurementsDataLoader.refresh(searchTerms);
          return response || [];
        }}
        onSelectOptions={(selectedOptions: Measurement[]) => {
          onChange(selectedOptions);
        }}
      />
    </Box>
  );
};
