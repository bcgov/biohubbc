import { mdiPencil, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { grey } from '@mui/material/colors';
import Grid from '@mui/material/Grid';
import EditDialog from 'components/dialog/EditDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import { AttachmentType } from 'constants/attachments';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual as _deepEquals } from 'lodash';
import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { datesSameNullable, setMessageSnackbar } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { IAnimal } from './animal';
import {
  AnimalTelemetryDeviceSchema,
  Device,
  IAnimalDeployment,
  IAnimalTelemetryDevice,
  IDeploymentTimespan
} from './telemetry-device/device';
import { TelemetryFileUpload } from './telemetry-device/TelemetryFileUpload';

export enum TELEMETRY_DEVICE_FORM_MODE {
  ADD = 'add',
  EDIT = 'edit'
}

export interface IAnimalTelemetryDeviceFile extends IAnimalTelemetryDevice {
  attachmentFile?: File;
  attachmentType?: AttachmentType;
}

export const AttachmentFormSection = (props: { index: number; deviceMake: string }) => {
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

export const DeploymentFormSection = ({
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
                  name={`device.${index}.deployments.${i}.attachment_start`}
                  required={true}
                  label={'Start Date'}
                />
              </Grid>
              <Grid item xs={mode === TELEMETRY_DEVICE_FORM_MODE.ADD ? 6 : 5.5}>
                <SingleDateField name={`device.${index}.deployments.${i}.attachment_end`} label={'End Date'} />
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
  values: IAnimalTelemetryDeviceFile[] | IAnimalTelemetryDevice[];
  index: number;
  removeAction: (deploymentId: string) => void;
}

export const DeviceFormSection = ({ values, index, mode, removeAction }: IDeviceFormSectionProps): JSX.Element => {
  const api = useTelemetryApi();

  const { data: bctwDeviceData, refresh } = useDataLoader(() => api.devices.getDeviceDetails(values[index].device_id));

  useEffect(() => {
    if (values?.[index]?.device_id) {
      refresh();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.[index]?.device_id]);

  if (!values[index]) {
    return <></>;
  }

  return (
    <>
      <Box component="fieldset">
        <Typography component="legend" variant="body2">
          Device Metadata
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <CustomTextField
              label="Device ID"
              name={`device.${index}.device_id`}
              other={{ disabled: mode === 'edit' }}
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
                <CustomTextField label="Frequency (Optional)" name={`device.${index}.frequency`} />
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
                  name={`device.${index}.frequency_unit`}
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
              name={`device.${index}.device_make`}
              id="manufacturer"
              fetchData={api.devices.getCollarVendors}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField label="Device Model (Optional)" name={`device.${index}.device_model`} />
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
  survey_critter_id: number;
  critterData?: IDetailedCritterWithInternalId[];
  deploymentData?: IAnimalDeployment[];
  removeAction: (deployment_id: string) => void;
}

const TelemetryDeviceForm = ({
  survey_critter_id,
  critterData,
  deploymentData,
  removeAction
}: ITelemetryDeviceFormProps) => {
  const bhApi = useBiohubApi();
  const telemetryApi = useTelemetryApi();
  const { values, initialValues } = useFormikContext<IAnimal>();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { surveyId, projectId, artifactDataLoader } = useContext(SurveyContext);
  const dialogContext = useContext(DialogContext);

  const DeviceFormValues: IAnimalTelemetryDevice = useMemo(() => {
    return {
      device_id: '' as unknown as number,
      device_make: '',
      frequency: '' as unknown as number,
      frequency_unit: '',
      device_model: '',
      deployments: [
        {
          deployment_id: '',
          attachment_start: '',
          attachment_end: undefined
        }
      ]
    };
  }, []);

  const deviceInitialValues = useMemo(() => {
    if (selectedIndex != null) {
      return initialValues;
    } else {
      return { device: [DeviceFormValues] };
    }
  }, [DeviceFormValues, initialValues, selectedIndex]);

  const uploadAttachment = async (file?: File, attachmentType?: AttachmentType) => {
    try {
      if (file && attachmentType === AttachmentType.KEYX) {
        await bhApi.survey.uploadSurveyKeyx(projectId, surveyId, file);
      } else if (file && attachmentType === AttachmentType.OTHER) {
        await bhApi.survey.uploadSurveyAttachments(projectId, surveyId, file);
      }
    } catch (error) {
      throw new Error(`Failed to upload attachment ${file?.name}`);
    }
  };

  const handleAddTelemetry = async (survey_critter_id: number, data: IAnimalTelemetryDeviceFile[]) => {
    const critter = critterData?.find((a) => a.survey_critter_id === survey_critter_id);
    if (!critter) console.log('Did not find critter in addTelemetry!');
    const { attachmentFile, attachmentType, ...critterTelemetryDevice } = {
      ...data[0],
      critter_id: critter?.critter_id ?? ''
    };
    try {
      // Upload attachment if there is one
      await uploadAttachment(attachmentFile, attachmentType);
      // create new deployment record
      await bhApi.survey.addDeployment(projectId, surveyId, survey_critter_id, critterTelemetryDevice);
      setMessageSnackbar('Successfully added deployment.', dialogContext);
      artifactDataLoader.refresh(projectId, surveyId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessageSnackbar('Failed to add deployment' + (error?.message ? `: ${error.message}` : '.'), dialogContext);
      } else {
        setMessageSnackbar('Failed to add deployment.', dialogContext);
      }
    }
  };

  const updateDevice = async (formValues: IAnimalTelemetryDevice) => {
    const existingDevice = deploymentData?.find((deployment) => deployment.device_id === formValues.device_id);
    const formDevice = new Device({ collar_id: existingDevice?.collar_id, ...formValues });
    if (existingDevice && !_deepEquals(new Device(existingDevice), formDevice)) {
      try {
        await telemetryApi.devices.upsertCollar(formDevice);
      } catch (error) {
        throw new Error(`Failed to update collar ${formDevice.collar_id}`);
      }
    }
  };

  const updateDeployments = async (formDeployments: IDeploymentTimespan[], survey_critter_id: number) => {
    for (const formDeployment of formDeployments ?? []) {
      const existingDeployment = deploymentData?.find(
        (animalDeployment) => animalDeployment.deployment_id === formDeployment.deployment_id
      );
      if (
        !datesSameNullable(formDeployment?.attachment_start, existingDeployment?.attachment_start) ||
        !datesSameNullable(formDeployment?.attachment_end, existingDeployment?.attachment_end)
      ) {
        try {
          await bhApi.survey.updateDeployment(projectId, surveyId, survey_critter_id, formDeployment);
        } catch (error) {
          throw new Error(`Failed to update deployment ${formDeployment.deployment_id}`);
        }
      }
    }
  };

  const handleEditTelemetry = async (survey_critter_id: number, data: IAnimalTelemetryDeviceFile[]) => {
    const errors: string[] = [];
    for (const { attachmentFile, attachmentType, ...formValues } of data) {
      try {
        await uploadAttachment(attachmentFile, attachmentType);
        await updateDevice(formValues);
        await updateDeployments(formValues.deployments ?? [], survey_critter_id);
      } catch (error) {
        errors.push(`Device ${formValues.device_id} - ` + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
    errors.length
      ? setMessageSnackbar('Failed to save some data: ' + errors.join(', '), dialogContext)
      : setMessageSnackbar('Updated deployment and device data successfully.', dialogContext);
  };

  const handleTelemetrySave = async (
    survey_critter_id: number,
    data: IAnimalTelemetryDeviceFile[],
    telemetryFormMode: TELEMETRY_DEVICE_FORM_MODE
  ) => {
    if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.ADD) {
      await handleAddTelemetry(survey_critter_id, data);
      setOpenDialog(false);
    } else if (telemetryFormMode === TELEMETRY_DEVICE_FORM_MODE.EDIT) {
      await handleEditTelemetry(survey_critter_id, data);
      setOpenDialog(false);
    }
  };

  const telemetryFormMode = selectedIndex != null ? TELEMETRY_DEVICE_FORM_MODE.EDIT : TELEMETRY_DEVICE_FORM_MODE.ADD;

  return (
    <>
      <Button
        onClick={() => {
          setSelectedIndex(null);
          setOpenDialog(true);
        }}
        sx={{ marginBottom: 3 }}
        variant="contained"
        color="primary">
        New Device / Deployment
      </Button>
      <EditDialog
        dialogTitle={'New Device / Deployment'}
        open={openDialog}
        component={{
          element: (
            <DeviceFormSection
              values={deviceInitialValues.device}
              index={selectedIndex ?? 0}
              mode={telemetryFormMode}
              removeAction={() => {}}
            />
          ),
          initialValues: deviceInitialValues,
          validationSchema: yup.object({ device: yup.array(AnimalTelemetryDeviceSchema) })
        }}
        onCancel={() => setOpenDialog(false)}
        onSave={(data) => handleTelemetrySave(survey_critter_id, data.device, telemetryFormMode)}></EditDialog>
      {values.device?.map((device, idx) => (
        <Card
          key={`device-form-section-${device.device_id}`}
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
            <Box display="flex" flexDirection={'row'} alignItems={'center'}>
              <Typography>{`Vendor: ${device.device_make} / Model: ${device.device_model || 'N/A'} / Deployments: ${
                device.deployments?.length
              }`}</Typography>
              <IconButton
                sx={{ marginLeft: 'auto' }}
                onClick={() => {
                  setSelectedIndex(idx);
                  setOpenDialog(true);
                }}>
                <Icon path={mdiPencil} size={1}></Icon>
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default TelemetryDeviceForm;
