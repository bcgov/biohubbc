import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Returns an overlay with instructions on how to use the analytics feature.
 *
 * @return {*}
 */
export const ObservationAnalyticsNoDataOverlay = () => {
  return (
    <Box
      position="relative"
      display="flex"
      height="80%"
      flex="1 1 auto"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{
        '& .MuiTypography-root': { color: grey[600] }
      }}>
      <Stack spacing={3} sx={{ width: { xs: '90%', sm: '65%', xl: '50%' }, textAlign: 'center' }}>
        <Typography variant="h4">Calculate sex ratios, demographics, and more</Typography>
        <Stack spacing={1} sx={{ textAlign: 'left' }}>
          <Typography>
            <strong>Choose fields to analyze</strong>
          </Typography>
          <Typography variant="body2">
            The group by options depend on which fields apply to your observations. To add options, such as life stage
            and sex, add fields to your observations by configuring your observations table.
          </Typography>
        </Stack>
        <Stack spacing={1} sx={{ textAlign: 'left' }}>
          <Typography>
            <strong>How the calculations work</strong>&nbsp;
          </Typography>
          <Typography variant="body2">
            The number observations and individuals will be calculated for each group. For example, if you group by life
            stage, the number of individuals belonging to each life stage category will be calculated. If you group by
            multiple fields, such as life stage and sex, the number of individuals belonging to each life stage and sex
            combination will be calculated.
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
