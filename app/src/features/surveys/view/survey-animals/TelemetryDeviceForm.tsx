import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Divider, FormHelperText, IconButton, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import YesNoDialog from 'components/dialog/YesNoDialog';
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

const AttachmentFormSection = (props: { index: number; deviceMake: string }) => {
  return (
    <Paper sx={{ padding: 3 }}>
      {props.deviceMake === 'Vectronic' && (
        <>
          <Typography sx={{ ml: 1, mb: 3 }}>{`Upload Vectronic KeyX File`}</Typography>
          <TelemetryFileUpload attachmentType={AttachmentType.KEYX} index={props.index} />
        </>
      )}
      {props.deviceMake === 'Lotek' && (
        <>
          <Typography sx={{ ml: 1, mb: 3 }}>{`Upload Lotek Config File`}</Typography>
          <TelemetryFileUpload attachmentType={AttachmentType.OTHER} index={props.index} />
        </>
      )}
    </Paper>
  );
};

const DeploymentFormSection = ({
  index,
  deployments,
  mode,
  removeAction
}: {
  index: number;
  deployments: IDeploymentTimespan[];
  mode: TELEMETRY_DEVICE_FORM_MODE;
  removeAction: (deployment_id: string) => void;
}): JSX.Element => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deploymentToDelete, setDeploymentToDelete] = useState('');
  return (
    <>
      <YesNoDialog
        dialogTitle={'Remove deployment?'}
        dialogText={`Are you sure you want to remove this deployment? 
          If you would like to end a deployment / unattach a device, you should instead set the attachment end date. 
          Please confirm that you wish to permanently erase this deployment.`}
        open={openDeleteDialog}
        yesButtonLabel="Delete"
        noButtonLabel="Cancel"
        yesButtonProps={{ color: 'error' }}
        onClose={() => setOpenDeleteDialog(false)}
        onNo={() => setOpenDeleteDialog(false)}
        onYes={async () => {
          await removeAction(String(deploymentToDelete));
          setOpenDeleteDialog(false);
        }}></YesNoDialog>
      <Grid container spacing={2}>
        {deployments.map((deploy, i) => {
          return (
            <Fragment key={`deployment-item-${deploy.deployment_id}`}>
              <Grid item xs={mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 6 : 5.5}>
                <SingleDateField
                  name={`${index}.deployments.${i}.attachment_start`}
                  required={true}
                  label={'Attachment Start'}
                />
              </Grid>
              <Grid item xs={mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 6 : 5.5}>
                <SingleDateField name={`${index}.deployments.${i}.attachment_end`} label={'Attachment End'} />
              </Grid>
              {mode === TELEMETRY_DEVICE_FORM_MODE.EDIT && (
                <Grid item xs={1}>
                  <IconButton
                    sx={{ mt: 1 }}
                    title="Remove Deployment"
                    aria-label="remove-deployment"
                    onClick={() => {
                      setDeploymentToDelete(String(deploy.deployment_id));
                      setOpenDeleteDialog(true);
                    }}>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </IconButton>
                </Grid>
              )}
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
  removeAction: (deploymentId: string) => void;
}

const DeviceFormSection = ({ values, index, mode, removeAction }: IDeviceFormSectionProps): JSX.Element => {
  const { setStatus } = useFormikContext<{ formValues: IAnimalTelemetryDeviceFile[] }>();
  const [bctwErrors, setBctwErrors] = useState<Record<string, string | undefined>>({});
  const api = useTelemetryApi();

  const { data: bctwDeviceData, refresh } = useDataLoader(() => api.devices.getDeviceDetails(values[index].device_id));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values[index].device_id]);

  useEffect(() => {
    const errors: { attachment_start?: string } = {};
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
      {((values[index].device_make === 'Vectronic' && !bctwDeviceData?.keyXStatus) ||
        values[index].device_make === 'Lotek') && (
        <Box sx={{ mt: 3 }}>
          <AttachmentFormSection index={index} deviceMake={values[index].device_make} />
        </Box>
      )}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ padding: 3 }}>
          <Typography sx={{ ml: 1, mb: 3 }}>Deployments</Typography>
          {
            <DeploymentFormSection
              removeAction={removeAction}
              mode={mode}
              index={index}
              deployments={values[index].deployments ?? []}
            />
          }
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
  removeAction: (deployment_id: string) => void;
}

const TelemetryDeviceForm = ({ mode, removeAction }: ITelemetryDeviceFormProps) => {
  const { values } = useFormikContext<IAnimalTelemetryDeviceFile[]>();

  return (
    <>
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
                removeAction={removeAction}
              />
              <Divider sx={{ mt: 3 }} />
            </Box>
          ))}
        </>
      </Form>
    </>
  );
};

export default TelemetryDeviceForm;
