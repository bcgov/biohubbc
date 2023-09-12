import { FormHelperText } from '@mui/material';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import { Form, useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { IAnimalTelemetryDevice } from './animal';

const TelemetryDeviceForm = () => {
  const { values, setStatus } = useFormikContext<IAnimalTelemetryDevice>();
  const [bctwErrors, setBctwErrors] = useState<Record<string, string | undefined>>({});
  const api = useTelemetryApi();
  const {
    data: deviceData,
    load: loadDevice,
    refresh
  } = useDataLoader(() => api.devices.getDeviceDetails(values.device_id));

  useEffect(() => {
    loadDevice();
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.device_id]);

  useEffect(() => {
    const errors: { device_make?: string; attachment_start?: string } = {};
    if (deviceData?.device && deviceData.device?.device_make !== values.device_make) {
      errors.device_make = `Submitting this form would change the registered device make of device ${values.device_id}, which is disallowed.`;
    }

    const existingDeployment = deviceData?.deployments?.find(
      (a) =>
        (moment(values.attachment_start).isSameOrAfter(moment(a.attachment_start)) &&
          moment(values.attachment_start).isSameOrBefore(moment(a.attachment_end))) ||
        a.attachment_end == null
    );
    if (existingDeployment) {
      errors.attachment_start = `Cannot make a deployment starting on this date, it will conflict with deployment ${
        existingDeployment.deployment_id
      } 
      running from ${existingDeployment.attachment_start} until ${existingDeployment.attachment_end ?? 'indefinite'}.`;
    }
    setBctwErrors(errors);
    setStatus({ forceDisable: Object.entries(errors).length > 0 });
  }, [deviceData, setStatus, values]);

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
        {Object.entries(bctwErrors).length > 0 && (
          <Grid item xs={12}>
            {Object.values(bctwErrors).map((a) => (
              <FormHelperText error={true}>{a}</FormHelperText>
            ))}
          </Grid>
        )}
      </Grid>
    </Form>
  );
};

export default TelemetryDeviceForm;
