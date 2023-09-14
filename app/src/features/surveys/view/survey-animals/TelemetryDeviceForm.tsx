import { Box, Divider, FormHelperText, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import { Form, useFormikContext } from 'formik';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { Fragment, useState } from 'react';
import { IAnimalDeployment, IAnimalTelemetryDevice } from './animal';

export type TelemetryDeviceFormMode = 'add' | 'edit';

// interface ITelemetryDeviceFormProps {
//   mode: TelemetryDeviceFormMode;
//   critter_id?: string;
//   deployments: IAnimalDeployment[];
// }
const DeploymentFormSection = ({
  index,
  deployments
}: {
  index: number;
  deployments: Pick<IAnimalDeployment, 'attachment_start' | 'attachment_end'>[];
}): JSX.Element => {
  return (
    <>
      <Grid container spacing={2}>
        {deployments.map((a, i) => {
          return (
            <Fragment key={`deployment-item-${i}`}>
              <Grid item xs={6}>
                <SingleDateField
                  name={`${index}.deployments.${i}.attachment_start`}
                  required={true}
                  label={'Attachment Start'}
                  other={{ size: 'small' }}
                />
              </Grid>
              <Grid item xs={6}>
                <SingleDateField
                  name={`${index}.deployments.${i}.attachment_end`}
                  required={true}
                  label={'Attachment End'}
                  other={{ size: 'small' }}
                />
              </Grid>
            </Fragment>
          );
        })}
      </Grid>
    </>
  );
};

const DeviceFormSection = ({ values, index }: { values: IAnimalTelemetryDevice[]; index: number }): JSX.Element => {
  // const { values, setStatus } = useFormikContext<{ formValues: IAnimalTelemetryDevice[] }>();
  const [bctwErrors, setBctwErrors] = useState<Record<string, string | undefined>>({});
  const api = useTelemetryApi();

  // const {
  //   data: bctwDeviceData,
  //   load: loadDevice,
  //   refresh
  // } = useDataLoader(() => api.devices.getDeviceDetails(values.formValues[index].device_id));

  // useEffect(() => {
  //   loadDevice();
  //   refresh();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [values.formValues[index].device_id]);

  /*useEffect(() => {
    const errors: { device_make?: string; attachment_start?: string } = {};
    if (bctwDeviceData?.device && bctwDeviceData.device?.device_make !== values.device_make) {
      errors.device_make = `Submitting this form would change the registered device make of device ${values.device_id}, which is disallowed.`;
    }

    const existingDeployment = bctwDeviceData?.deployments?.find(
      (a) =>
        (moment(values.attachment_start).isSameOrAfter(moment(a.attachment_start)) &&
          moment(values.attachment_start).isSameOrBefore(moment(a.attachment_end))) ||
        a.attachment_end == null
    );
    if (existingDeployment) {
      errors.attachment_start = `Cannot make a deployment starting on this date, it will conflict with deployment ${
        existingDeployment.deployment_id
      } 
      running from ${existingDeployment.attachment_start} until ${
        existingDeployment.attachment_end ?? 'indefinite'
      }.`;
    }
    setBctwErrors(errors);
    setStatus({ forceDisable: Object.entries(errors).length > 0 });
  }, [bctwDeviceData, setStatus, values]);*/

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CustomTextField label="Device ID" name={`${index}.device_id`} other={{ size: 'small' }} />
        </Grid>
        <Grid item xs={4}>
          <CustomTextField label="Device Frequency" name={`${index}.frequency`} other={{ size: 'small' }} />
        </Grid>
        <Grid item xs={2}>
          <TelemetrySelectField
            label="Unit"
            name={`${index}.frequency_unit`}
            id="frequency_unit"
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
            name={`${index}.device_make`}
            id="manufacturer"
            fetchData={api.devices.getCollarVendors}
            controlProps={{ size: 'small' }}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField label="Device Model" name={`${index}.device_model`} other={{ size: 'small' }} />
        </Grid>
        {Object.entries(bctwErrors).length > 0 && (
          <Grid item xs={12}>
            {Object.values(bctwErrors).map((a, i) => (
              <FormHelperText key={`form-error-text-${i}`} error={true}>
                {a}
              </FormHelperText>
            ))}
          </Grid>
        )}
      </Grid>
      <Box marginTop={'12px'}>
        <Paper sx={{ padding: '12px' }}>
          <Typography marginLeft={'6px'} marginBottom={'12px'}>
            Deployments
          </Typography>
          {<DeploymentFormSection index={index} deployments={values[index].deployments ?? []} />}
        </Paper>
      </Box>
    </>
  );
};

const TelemetryDeviceForm = () => {
  const { values } = useFormikContext<IAnimalTelemetryDevice[]>();

  return (
    <Form>
      <>
        {values.map((a, i) => (
          <Box key={`device-form-section-${i}`} marginTop={'12px'}>
            <Typography marginLeft={'12px'} marginBottom={'12px'}>
              Device Metadata
            </Typography>
            <DeviceFormSection values={values} key={`device-form-section-${i}`} index={i} />
            <Divider sx={{ mt: '24px' }} />
          </Box>
        ))}
      </>
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </Form>
  );
};

export default TelemetryDeviceForm;
