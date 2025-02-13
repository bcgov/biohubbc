import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about standards and allowed values (eg. species-dependent attributes, environments)
 * 
 * @returns {*}
 */
export const SupportStandards = () => {
  return (
    <Stack gap={5} mb={3}>
      <Box>
        <Typography gutterBottom mb={2}>
          Standards describe what information you can upload, and in what format. Aligning your data with provincial
          standards enables comparisons with other datasets and helps make your information easy to understand.
        </Typography>
        <Typography gutterBottom mb={2}>
          As best practices change and new types of data get collected, we expect the standards to evolve &mdash;so
          we've made it easy to do so.
        </Typography>
        <Typography gutterBottom>
          If you need a new option added to a dropdown menu or a new piece of data to be supported, please email{' '}
          <a href="mailto:spi_mail@gov.bc.ca">spi_mail@gov.bc.ca</a> with your request.
        </Typography>
      </Box>
    </Stack>
  );
};
