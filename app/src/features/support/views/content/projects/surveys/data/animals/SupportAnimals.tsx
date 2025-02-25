import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about Animals
 *
 * @returns {*} {JSX.Element}
 */
export const SupportAnimals = (): JSX.Element => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography>
        Animals are known individuals that have captured or marked. When you add an Animals to your Survey, you're
        establishing create a profile for that individual that can be referenced again in the future. This makes it
        possible to gather all information about a specific individual.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Captures
      </Typography>
      <Typography gutterBottom>
        You can add information about where and when you captured an animal, along with any markings that you applied or
        measurements that you recorded. To add a capture, you must first add the animal.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Markings
      </Typography>
      <Typography gutterBottom>You can add markings that you applied during a capture event.</Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Mortalities
      </Typography>
      <Typography gutterBottom>You can add information about where and when the animal died.</Typography>
    </Box>
  </Stack>
);
