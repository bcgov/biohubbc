import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IQualitativeMeasurementResponse, IQuantitativeMeasurementResponse } from 'interfaces/useCritterApi.interface';
import startCase from 'lodash-es/startCase';
import { v4 } from 'uuid';

interface IMeasurementDetailsProps {
  measurements: { qualitative: IQualitativeMeasurementResponse[]; quantitative: IQuantitativeMeasurementResponse[] };
}

/**
 * Generic component to display animal measurement details.
 *
 * @param {IMeasurementDetailsProps} props
 * @return {*}
 */
export const MeasurementDetails = (props: IMeasurementDetailsProps) => {
  const { measurements } = props;

  if (!measurements.qualitative.length && !measurements.quantitative.length) {
    return null;
  }

  const allMeasurements = [...measurements.quantitative, ...measurements.qualitative];

  return (
    <Box>
      <Typography color="textSecondary" fontWeight={700} fontSize="0.75rem" sx={{ textTransform: 'uppercase' }}>
        Measurements
      </Typography>
      <Box maxHeight="300px" sx={{ overflow: 'auto', pr: 1 }}>
        {allMeasurements.map((measurement) => (
          <Paper variant="outlined" sx={{ px: 3, py: 2, bgcolor: grey[100], mt: 1 }} key={v4()}>
            <Typography fontWeight={700} variant="body2">
              {startCase(measurement.measurement_name)}:{' '}
              <Typography component="span" variant="body2">
                {measurement.value}
              </Typography>
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};
