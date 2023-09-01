import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import { Form, useFormikContext } from 'formik';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { getAnimalFieldName, IAnimal, IAnimalTelemetryDevice } from './animal';

const TelemetryDeviceForm = () => {
  const { values } = useFormikContext<IAnimal>();
  console.log('values', values.device);

  const api = useTelemetryApi();
  const name: keyof IAnimal = 'device';

  return (
    <Form>
      <Typography variant="h4">Add Telemetry Device</Typography>
      <Grid item xs={6}>
        <CustomTextField
          label="Device ID"
          name={getAnimalFieldName<IAnimalTelemetryDevice>(name, 'device_id')}
          other={{ size: 'small' }}
        />
      </Grid>
      <Grid item xs={6}>
        <CustomTextField
          label="Device Frequency"
          name={getAnimalFieldName<IAnimalTelemetryDevice>(name, 'device_frequency')}
          other={{ size: 'small' }}
        />
      </Grid>
      <Grid item xs={6}>
        <TelemetrySelectField
          label="Device Manufacturer"
          name={getAnimalFieldName<IAnimalTelemetryDevice>(name, 'manufacturer')}
          id="manufacturer"
          fetchData={api.devices.getCollarVendors}
          controlProps={{ size: 'small' }}
        />
      </Grid>
      <Grid item xs={6}>
        <CustomTextField
          label="Device Model"
          name={getAnimalFieldName<IAnimalTelemetryDevice>(name, 'model')}
          other={{ size: 'small' }}
        />
      </Grid>
    </Form>
  );
};

export default TelemetryDeviceForm;
