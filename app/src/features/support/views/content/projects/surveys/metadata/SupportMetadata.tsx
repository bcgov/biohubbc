import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about Metadata
 *
 * @returns {*} {JSX.Element}
 */
export const SupportMetadata = (): JSX.Element => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography>
        The term <i>metadata</i> describes all of the information that you entered when initially creating your Survey,
        such as the focal species, broad area of interest, and objectives. This information aims to give context to the
        data in your Survey.
      </Typography>
    </Box>
  </Stack>
);
