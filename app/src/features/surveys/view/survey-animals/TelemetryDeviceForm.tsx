import { Box, FormHelperText, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import { Form, useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import moment from 'moment';
import { Fragment, useEffect, useState } from 'react';
import { IAnimalTelemetryDevice, IDeploymentTimespan } from './device';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { grey } from '@mui/material/colors';

export enum TELEMETRY_DEVICE_FORM_MODE {
  ADD = 'add',
  EDIT = 'edit'
}

const DeploymentFormSection = ({
  index,
  deployments
}: {
  index: number;
  deployments: IDeploymentTimespan[];
}): JSX.Element => {
  return (
    <>
      <Grid container spacing={3}>
        {deployments.map((deploy, i) => {
          return (
            <Fragment key={`deployment-item-${deploy.deployment_id}`}>
              <Grid item xs={6}>
                <SingleDateField
                  name={`${index}.deployments.${i}.attachment_start`}
                  required={true}
                  label={'Start Date'}
                />
              </Grid>
              <Grid item xs={6}>
                <SingleDateField name={`${index}.deployments.${i}.attachment_end`} label={'End Date'} />
              </Grid>
            </Fragment>
          );
        })}
      </Grid>
    </>
  );
};

interface IDeviceFormSectionProps {
  mode: TELEMETRY_DEVICE_FORM_MODE;
  values: IAnimalTelemetryDevice[];
  index: number;
}

const DeviceFormSection = ({ values, index, mode }: IDeviceFormSectionProps): JSX.Element => {
  const { setStatus } = useFormikContext<{ formValues: IAnimalTelemetryDevice[] }>();
  const [bctwErrors, setBctwErrors] = useState<Record<string, string | undefined>>({});
  const api = useTelemetryApi();

  const { data: bctwDeviceData, refresh } = useDataLoader(() => api.devices.getDeviceDetails(values[index].device_id));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values[index].device_id]);

  useEffect(() => {
    const errors: { device_make?: string; attachment_start?: string } = {};
    if (bctwDeviceData?.device && bctwDeviceData.device?.device_make !== values[index].device_make) {
      errors.device_make = `Submitting this form would change the registered device make of device ${values[index].device_id}, which is disallowed.`;
    }

    for (const deployment of values[index].deployments ?? []) {
      const existingDeployment = bctwDeviceData?.deployments?.find(
        (a) =>
          deployment.deployment_id !== a.deployment_id &&
          moment(deployment.attachment_start).isSameOrAfter(moment(a.attachment_start)) &&
          (moment(deployment.attachment_start).isSameOrBefore(moment(a.attachment_end)) || a.attachment_end == null)
      ); //Check if there is already a deployment that is not the same id as this one and overlaps the time we are trying to upload.
      if (existingDeployment) {
        errors.attachment_start = `Cannot make a deployment starting on this date, it will conflict with deployment ${
          existingDeployment.deployment_id
        } 
        running from ${existingDeployment.attachment_start} until ${
          existingDeployment.attachment_end ?? 'indefinite'
        }.`;
      }
    }

    setBctwErrors(errors);
    setStatus({ forceDisable: Object.entries(errors).length > 0 });
  }, [bctwDeviceData, index, setStatus, values]);

  return (
    <>
      <Box component="fieldset">
        <Typography component="legend" variant="body2">Device Metadata</Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <CustomTextField label="Device ID" name={`${index}.device_id`} other={{ disabled: mode === 'edit' }} />
          </Grid>
          <Grid item xs={6}>
            <Grid container>
              <Grid item xs={8}
                sx={{
                  '& .MuiInputBase-root': {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                  }
                }}
              >
                <CustomTextField label="Frequency (Optional)" name={`${index}.frequency`} />
              </Grid>
              <Grid item xs={4}
                sx={{
                  '& .MuiInputBase-root': {
                    ml: '-1px',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0
                  }
                }}
              >
                <TelemetrySelectField
                  label="Units"
                  name={`${index}.frequency_unit`}
                  id="frequency_unit"
                  fetchData={async () => {
                    const codeVals = await api.devices.getCodeValues('frequency_unit');
                    return codeVals.map((a) => a.description);
                  }}
                  
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <TelemetrySelectField
              label="Device Manufacturer"
              name={`${index}.device_make`}
              id="manufacturer"
              fetchData={api.devices.getCollarVendors}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField label="Device Model (Optional)" name={`${index}.device_model`} />
          </Grid>
        </Grid>
      </Box>
      <Box component="fieldset" sx={{ mt: 3 }}>
        
        <Typography component="legend" variant="body2">Deployment Dates</Typography>
        
        {<DeploymentFormSection index={index} deployments={values[index].deployments ?? []} />}

        {Object.entries(bctwErrors).length > 0 && (
          <Grid item xs={12}>
            {Object.entries(bctwErrors).map((bctwError) => (
              <FormHelperText key={`bctw-error-${bctwError[0]}`} error={true}>
                {bctwError[1]}
              </FormHelperText>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
};

interface ITelemetryDeviceFormProps {
  mode: TELEMETRY_DEVICE_FORM_MODE;
}

const TelemetryDeviceForm = ({ mode }: ITelemetryDeviceFormProps) => {
  const { values } = useFormikContext<IAnimalTelemetryDevice[]>();

  return (
    <Form>
      <> 
        {values.map((device, idx) => (
          <Card key={`device-form-section-${mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 'add' : device.device_id}`}
            variant="outlined"
            sx={{
              '& + div': {
                mt: 2
              },
              '&:only-child': {
                border: 'none',
                '& .MuiCardHeader-root': {
                  display: 'none'
                },
                '& .MuiCardContent-root': {
                  padding: 0
                }
              }
            }}
          >
            <CardHeader 
              title={'Device ID:' + ' ' + device.device_id}
              sx={{
                background: grey[100],
                borderBottom: '1px solid' + grey[300],
                '& .MuiCardHeader-title': {
                  fontSize: '1.125rem'
                }
              }}  
            >
            </CardHeader>
            <CardContent>
              <DeviceFormSection
                mode={mode}
                values={values}
                key={`device-form-section-${mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 'add' : device.device_id}`}
                index={idx}
              />
            </CardContent>
          </Card>
        ))} 
      </>
    </Form>
  );
};

export default TelemetryDeviceForm;
