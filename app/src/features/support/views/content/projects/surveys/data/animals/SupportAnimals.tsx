import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about Animals
 *
 * @returns {*}
 */
export const SupportAnimals = () => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography key="project-components-2">
        Animals are known individuals that have captured or marked. When you add an Animals to your Survey, you're
        establishing create a profile for that individual that can be referenced again in the future. This makes it
        possible to gather all information about a specific individual.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Captures
      </Typography>
      <Typography gutterBottom key="gensims2">
        You can add information about where and when you captured an animal, along with any markings that you applied or
        measurements that you recorded.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Markings
      </Typography>
      <Typography gutterBottom key="gensims2">
        You can add markings that you applied during a capture event.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Mortalities
      </Typography>
      <Typography gutterBottom key="gensims2">
        You can add information about where and when the animal died.
      </Typography>
    </Box>
  </Stack>
);
