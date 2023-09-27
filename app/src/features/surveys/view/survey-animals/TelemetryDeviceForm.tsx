import { Box, Divider, FormHelperText, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import { AttachmentType } from 'constants/attachments';
import { Form, useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import moment from 'moment';
import { Fragment, useEffect, useState } from 'react';
import { IAnimalTelemetryDevice, IDeploymentTimespan } from './device';
import { TelemetryFileUpload } from './TelemetryFileUpload';

export enum TELEMETRY_DEVICE_FORM_MODE {
  ADD = 'add',
  EDIT = 'edit'
}

export interface IAnimalTelemetryDeviceFile extends IAnimalTelemetryDevice {
  attachmentFile?: File;
  attachmentType?: AttachmentType;
}

const AttchmentFormSection = ({ index, deviceMake }: { index: number; deviceMake: string }): JSX.Element => {
  return (
    <Paper sx={{ padding: 3 }}>
      {deviceMake === 'Vectronic' && (
        <>
          <Typography sx={{ ml: 1, mb: 3 }}>{`Upload Vectronic KeyX File`}</Typography>
          <TelemetryFileUpload attachmentType={AttachmentType.KEYX} index={index} />
        </>
      )}
      {deviceMake === 'Lotek' && (
        <>
          <Typography sx={{ ml: 1, mb: 3 }}>{`Upload Lotek Config File`}</Typography>
          <TelemetryFileUpload attachmentType={AttachmentType.OTHER} index={index} />
        </>
      )}
    </Paper>
  );
};

const DeploymentFormSection = ({
  index,
  deployments
}: {
  index: number;
  deployments: IDeploymentTimespan[];
}): JSX.Element => {
  return (
    <>
      <Grid container spacing={2}>
        {deployments.map((deploy, i) => {
          return (
            <Fragment key={`deployment-item-${deploy.deployment_id}`}>
              <Grid item xs={6}>
                <SingleDateField
                  name={`${index}.deployments.${i}.attachment_start`}
                  required={true}
                  label={'Attachment Start'}
                />
              </Grid>
              <Grid item xs={6}>
                <SingleDateField name={`${index}.deployments.${i}.attachment_end`} label={'Attachment End'} />
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
  values: IAnimalTelemetryDeviceFile[];
  index: number;
}

const DeviceFormSection = ({ values, index, mode }: IDeviceFormSectionProps): JSX.Element => {
  const { setStatus } = useFormikContext<{ formValues: IAnimalTelemetryDeviceFile[] }>();
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
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CustomTextField label="Device ID" name={`${index}.device_id`} other={{ disabled: mode === 'edit' }} />
        </Grid>
        <Grid item xs={4}>
          <CustomTextField label="Device Frequency" name={`${index}.frequency`} />
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
          />
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
          <CustomTextField label="Device Model" name={`${index}.device_model`} />
        </Grid>
      </Grid>
      {mode === TELEMETRY_DEVICE_FORM_MODE.ADD &&
        ((values[index].device_make === 'Vectronic' && !bctwDeviceData?.keyXStatus) ||
          values[index].device_make === 'Lotek') && (
          <Box sx={{ mt: 3 }}>
            <AttchmentFormSection index={index} deviceMake={values[index].device_make} />
          </Box>
        )}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ padding: 3 }}>
          <Typography sx={{ ml: 1, mb: 3 }}>Deployments</Typography>
          {<DeploymentFormSection index={index} deployments={values[index].deployments ?? []} />}
        </Paper>
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
  const { values } = useFormikContext<IAnimalTelemetryDeviceFile[]>();

  return (
    <Form>
      <>
        {values.map((device, idx) => (
          <Box key={`device-form-section-${mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 'add' : device.device_id}`}>
            <Typography sx={{ mt: 2, mb: 2 }}>Device Metadata</Typography>
            <DeviceFormSection
              mode={mode}
              values={values}
              key={`device-form-section-${mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 'add' : device.device_id}`}
              index={idx}
            />
            <Divider sx={{ mt: 3 }} />
          </Box>
        ))}
      </>
    </Form>
  );
};

export default TelemetryDeviceForm;
