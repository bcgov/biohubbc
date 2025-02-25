import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about Telemetry
 *
 * @returns {*} {JSX.Element}
 */
export const SupportTelemetry = (): JSX.Element => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography>
        Telemetry is animal movement data collected from a tracking device. The tracking devices are typically GPS
        devices that automatically transmit an animal's location through satellites, but they also include very high
        frequency (VHF) devices where the animal is followed in the field.
      </Typography>
    </Box>

    <Box>
      <Typography variant="h3" mb={2}>
        Adding Telemetry Data
      </Typography>
      <Typography gutterBottom>
        To add telemetry data to your Survey, you must first add three pieces of information:
      </Typography>
      <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5 } }}>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography fontWeight={700}>Animal</Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography fontWeight={700}>Device</Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography fontWeight={700}>Deployment</Typography>
        </ListItem>
      </List>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Devices
      </Typography>
      <Typography gutterBottom>
        The device represents the physical unit transmitting data, usually identified by its serial number and
        manufacturer. We require you to add devices before linking them to deployments to help identify unique devices
        and simplify the management of telemetry data.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Animals
      </Typography>
      <Typography gutterBottom mb={2}>
        Animals are the individuals with telemetry devices. Before adding telemetry data, you must add the animal and
        then the capture event for that animal when the device was put on.
      </Typography>
      <Typography gutterBottom>
        When linking the animal and device, you'll reference the capture event when the device was put on to paint the
        full picture of your data.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Deployments
      </Typography>
      <Typography gutterBottom>
        A deployment is the <strong>link between an animal and device</strong>. Both the animal and device need to be
        added before the deployment. Once you have a deployment, you can import the telemetry data for that deployment.
      </Typography>
    </Box>
  </Stack>
);
