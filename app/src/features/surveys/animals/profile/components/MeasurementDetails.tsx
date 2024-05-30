import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IQualitativeMeasurementResponse, IQuantitativeMeasurementResponse } from 'interfaces/useCritterApi.interface';

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
      <Box maxHeight="300px" sx={{ overflow: 'auto', pr: 1, pb: 1 }}>
        {allMeasurements.map((measurement, index) => (
          <Paper sx={{ px: 3, py: 2, bgcolor: grey[100], mt: 1 }} key={`${measurement.taxon_measurement_id}-${index}`}>
            <Typography fontWeight={700}>
              {measurement.measurement_name}: <Typography component="span">{measurement.value}</Typography>
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};
