import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import { Form, useFormikContext } from 'formik';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IAnimal } from './animal';

const TelemetryDeviceForm = () => {
  useFormikContext<IAnimal>();
  const api = useTelemetryApi();
  return (
    <Form>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CustomTextField label="Device ID" name={'device_id'} other={{ size: 'small' }} />
        </Grid>
        <Grid item xs={4}>
          <CustomTextField label="Device Frequency" name={'frequency'} other={{ size: 'small' }} />
        </Grid>
        <Grid item xs={2}>
          <TelemetrySelectField
            label="Unit"
            name={'frequency_unit'}
            id="manufacturer"
            fetchData={async () => {
              const codeVals = await api.devices.getCodeValues('frequency_unit');
              return codeVals.map((a) => a.description);
            }}
            controlProps={{ size: 'small' }}
          />
        </Grid>
        <Grid item xs={6}>
          <TelemetrySelectField
            label="Device Manufacturer"
            name={'device_make'}
            id="manufacturer"
            fetchData={api.devices.getCollarVendors}
            controlProps={{ size: 'small' }}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField label="Device Model" name={'device_model'} other={{ size: 'small' }} />
        </Grid>
        <Grid item xs={6}>
          <SingleDateField
            name={'attachment_start'}
            required={true}
            label={'Attachment Start'}
            other={{ size: 'small' }}
          />
        </Grid>
      </Grid>
    </Form>
  );
};

export default TelemetryDeviceForm;
