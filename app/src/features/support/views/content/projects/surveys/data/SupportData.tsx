import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about Data
 *
 * @returns {*}
 */
export const SupportData = () => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography>
        The term <i>data</i> represents what you measured in your Survey. We use this term to distinguish your data from
        the sampling information, metadata, and supplementary details that help give context to your data.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Observations
      </Typography>
      <Typography gutterBottom mb={2}>
        Species observations are one of the main supported types of data. Observations are{' '}
        <strong>counts of species</strong>. If you're thinking you observed instead of counted a species, you can use a
        count of one, or even set your observations to represent presence&ndash;absence instead of true counts.
      </Typography>
      <Typography gutterBottom>
        Species observation can have information about the species' characteristics or the environment, revealing
        exactly what you counted and under what conditions that count was made. This lets you record the number of adult
        females, for example.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Telemetry
      </Typography>
      <Typography gutterBottom mb={2}>
        Telemetry is movement data collected from a tracking device and another supported data type. In a Survey, you
        can manage not just the positional telemetry data but also <strong>devices</strong> and{' '}
        <strong>deployments</strong> of those devices on animals.
      </Typography>
      <Typography gutterBottom>
        If you use Vectronic or Lotek devices, you can import your device keys for your Survey to automatically retrieve
        and display the latest telemetry data.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Animals
      </Typography>
      <Typography gutterBottom mb={2}>
        You can add information about individual animals to your Survey, letting you then add capture events, markings,
        and other information about the individual. When you add an animal, you establish a profile for that individual
        that can be referenced across Surveys. This information chain makes it easy to track all information about an
        individual over its lifetime.
      </Typography>
      <Typography gutterBottom>
        After adding Animals, you can link them to Observations to record exactly which individual was seen.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Habitat Features
      </Typography>
      <Typography gutterBottom>We are currently working on supporting data about wildlife habitat features.</Typography>
    </Box>
  </Stack>
);
