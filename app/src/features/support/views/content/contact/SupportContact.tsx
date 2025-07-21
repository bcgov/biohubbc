import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * General information about the Species Inventory Management System
 *
 * @returns {*} {JSX.Element}
 */
export const SupportContact = (): JSX.Element => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography gutterBottom mb={2}>
        Do you have a question, feedback, or any suggestions for the Species Inventory Management System? We'd love to
        hear from you.
      </Typography>
      <Typography>
        Please find our team at <a href="mailto:spi_mail@gov.bc.ca">spi_mail@gov.bc.ca</a>
      </Typography>
    </Box>
  </Stack>
);
