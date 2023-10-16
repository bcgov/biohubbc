import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { grey } from '@mui/material/colors';
import Grid from '@mui/material/Grid';
import YesNoDialog from 'components/dialog/YesNoDialog';
import CustomNumberField from 'components/fields/CustomNumberField';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import { AttachmentType } from 'constants/attachments';
import { PG_MAX_INT } from 'constants/misc';
import { Form, useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
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
    <>
      {props.deviceMake === 'Vectronic' && (
        <>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              mt: -1,
              mb: 3
            }}>{`Vectronic KeyX File (Optional)`}</Typography>
          <TelemetryFileUpload attachmentType={AttachmentType.KEYX} index={props.index} />
        </>
      )}
      {props.deviceMake === 'Lotek' && (
        <>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              mt: -1,
              mb: 3
            }}>{`Lotek Config File (Optional)`}</Typography>
          <TelemetryFileUpload attachmentType={AttachmentType.OTHER} index={props.index} />
        </>
      )}
    </>
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
  const [deploymentToDelete, setDeploymentToDelete] = useState<string | null>(null);
  return (
    <>
      <YesNoDialog
        dialogTitle={'Remove deployment?'}
        dialogText={`Are you sure you want to remove this deployment? 
          If you would like to end a deployment / unattach a device, you should set the attachment end date instead. 
          Please confirm that you wish to permanently erase this deployment.`}
        open={openDeleteDialog}
        yesButtonLabel="Delete"
        noButtonLabel="Cancel"
        yesButtonProps={{ color: 'error' }}
        onClose={() => setOpenDeleteDialog(false)}
        onNo={() => setOpenDeleteDialog(false)}
        onYes={async () => {
          if (deploymentToDelete) {
            removeAction(deploymentToDelete);
          }
          setOpenDeleteDialog(false);
        }}
      />
      <Grid container spacing={3}>
        {deployments.map((deploy, i) => {
          return (
            <Fragment key={`deployment-item-${deploy.deployment_id}`}>
              <Grid item xs={mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 6 : 5.5}>
                <SingleDateField
                  name={`${index}.deployments.${i}.attachment_start`}
                  required={true}
                  label={'Start Date'}
                />
              </Grid>
              <Grid item xs={mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 6 : 5.5}>
                <SingleDateField name={`${index}.deployments.${i}.attachment_end`} label={'End Date'} />
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
  const api = useTelemetryApi();

  const { data: bctwDeviceData, refresh } = useDataLoader(() => api.devices.getDeviceDetails(values[index].device_id));

  useEffect(() => {
    if (values[index].device_id) {
      refresh();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values[index].device_id]);

  return (
    <>
      <Box component="fieldset">
        <Typography component="legend" variant="body2">
          Device Metadata
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <CustomNumberField
              label="Device ID"
              name={`${index}.device_id`}
              disabled={mode === 'edit'}
              min={1}
              max={PG_MAX_INT}
            />
          </Grid>
          <Grid item xs={6}>
            <Grid container>
              <Grid
                item
                xs={8}
                sx={{
                  '& .MuiInputBase-root': {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                  }
                }}>
                <CustomTextField label="Frequency (Optional)" name={`${index}.frequency`} />
              </Grid>
              <Grid
                item
                xs={4}
                sx={{
                  '& .MuiInputBase-root': {
                    ml: '-1px',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0
                  }
                }}>
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
      {((values[index].device_make === 'Vectronic' && !bctwDeviceData?.keyXStatus) ||
        values[index].device_make === 'Lotek') && (
        <Box sx={{ mt: 3 }}>
          <Typography component="legend" variant="body2">
            Upload Attachment
          </Typography>
          <AttachmentFormSection index={index} deviceMake={values[index].device_make} />
        </Box>
      )}
      <Box component="fieldset" sx={{ mt: 3 }}>
        <Typography component="legend" variant="body2">
          Deployment Dates
        </Typography>
        {
          <DeploymentFormSection
            index={index}
            deployments={values[index].deployments ?? []}
            mode={mode}
            removeAction={removeAction}
          />
        }
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
    <Form>
      <>
        {values.map((device, idx) => (
          <Card
            key={`device-form-section-${mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 'add' : device.device_id}`}
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
            }}>
            <CardHeader
              title={`Device ID: ${device.device_id}`}
              sx={{
                background: grey[100],
                borderBottom: '1px solid' + grey[300],
                '& .MuiCardHeader-title': {
                  fontSize: '1.125rem'
                }
              }}></CardHeader>
            <CardContent>
              <DeviceFormSection
                mode={mode}
                values={values}
                key={`device-form-section-${mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 'add' : device.device_id}`}
                index={idx}
                removeAction={removeAction}
              />
            </CardContent>
          </Card>
        ))}
      </>
    </Form>
  );
};

export default TelemetryDeviceForm;
