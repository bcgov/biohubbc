import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import { Divider, ListItemIcon, Menu, MenuItem, Paper, Select, Stack, useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import { MenuProps } from '@mui/material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SkeletonListStack } from 'components/loading/SkeletonLoaders';
import { AttachmentType } from 'constants/attachments';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContext } from 'contexts/telemetryDataContext';
import { default as dayjs } from 'dayjs';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual as _deepEquals } from 'lodash';
import { get } from 'lodash-es';
import { useContext, useEffect, useMemo, useState } from 'react';
import { datesSameNullable } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { InferType } from 'yup';
import { ANIMAL_FORM_MODE } from '../view/survey-animals/animal';
import {
  AnimalTelemetryDeviceSchema,
  Device,
  IAnimalDeployment,
  IAnimalTelemetryDevice
} from '../view/survey-animals/telemetry-device/device';
import TelemetryDeviceForm from '../view/survey-animals/telemetry-device/TelemetryDeviceForm';
import ManualTelemetryCard from './ManualTelemetryCard';

export const AnimalDeploymentSchema = AnimalTelemetryDeviceSchema.shape({
  survey_critter_id: yup.number().required('An animal selection is required'), // add survey critter id to form
  critter_id: yup.string(),
  attachmentFile: yup.mixed(),
  attachmentType: yup.mixed<AttachmentType>().oneOf(Object.values(AttachmentType))
});
export type AnimalDeployment = InferType<typeof AnimalDeploymentSchema>;

export interface ICritterDeployment {
  critter: IDetailedCritterWithInternalId;
  deployment: IAnimalDeployment;
}

const ManualTelemetryList = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const surveyContext = useContext(SurveyContext);
  const telemetryContext = useContext(TelemetryDataContext);
  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();
  const telemetryApi = useTelemetryApi();

  const defaultFormValues = {
    survey_critter_id: '' as unknown as number, // form needs '' to display the no value text
    deployments: [
      {
        deployment_id: '',
        attachment_start: '',
        attachment_end: undefined
      }
    ],
    device_id: '' as unknown as number, // form needs '' to display the no value text
    device_make: '',
    device_model: '',
    frequency: undefined,
    frequency_unit: undefined,
    attachmentType: undefined,
    attachmentFile: undefined,
    critter_id: ''
  };

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formMode, setFormMode] = useState(ANIMAL_FORM_MODE.ADD);
  const [critterId, setCritterId] = useState<number | string>('');
  const [deviceId, setDeviceId] = useState<number>(0);
  const [formData, setFormData] = useState<AnimalDeployment>(defaultFormValues);

  useEffect(() => {
    surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  }, []);

  const deployments = useMemo(() => surveyContext.deploymentDataLoader.data, [surveyContext.deploymentDataLoader.data]);
  const critters = useMemo(() => surveyContext.critterDataLoader.data, [surveyContext.critterDataLoader.data]);

  const critterDeployments: ICritterDeployment[] = useMemo(() => {
    const data: ICritterDeployment[] = [];
    // combine all critter and deployments into a flat list
    surveyContext.deploymentDataLoader.data?.forEach((deployment) => {
      const critter = surveyContext.critterDataLoader.data?.find(
        (critter) => critter.critter_id === deployment.critter_id
      );
      if (critter) {
        data.push({ critter, deployment });
      }
    });
    return data;
  }, [surveyContext.critterDataLoader.data, surveyContext.deploymentDataLoader.data]);

  const handleMenuOpen = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, device_id: number) => {
    setAnchorEl(event.currentTarget);
    setDeviceId(device_id);

    const critterDeployment = critterDeployments.find((item) => item.deployment.device_id === device_id);
    const deviceDetails = await telemetryApi.devices.getDeviceDetails(device_id);

    // need to map deployment back into object for initial values
    if (critterDeployment) {
      const editData: AnimalDeployment = {
        survey_critter_id: Number(critterDeployment.critter?.survey_critter_id),
        deployments: [
          {
            deployment_id: critterDeployment.deployment.deployment_id,
            attachment_start: dayjs(critterDeployment.deployment.attachment_start).format('YYYY-MM-DD'),
            attachment_end: critterDeployment.deployment.attachment_end
              ? dayjs(critterDeployment.deployment.attachment_end).format('YYYY-MM-DD')
              : null
          }
        ],
        device_id: critterDeployment.deployment.device_id,
        device_make: deviceDetails.device?.device_make ? String(deviceDetails.device?.device_make) : '',
        device_model: deviceDetails.device?.device_model ? String(deviceDetails.device?.device_model) : '',
        frequency: deviceDetails.device?.frequency ? Number(deviceDetails.device?.frequency) : undefined,
        frequency_unit: deviceDetails.device?.frequency_unit ? String(deviceDetails.device?.frequency_unit) : '',
        attachmentType: undefined,
        attachmentFile: undefined,
        critter_id: critterDeployment.deployment.critter_id
      };
      setCritterId(critterDeployment.critter?.survey_critter_id);
      setFormData(editData);
    }
  };

  const handleSubmit = async (data: AnimalDeployment) => {
    if (formMode === ANIMAL_FORM_MODE.ADD) {
      // ADD NEW DEPLOYMENT
      await handleAddDeployment(data);
    } else {
      // EDIT EXISTING DEPLOYMENT
      await handleEditDeployment(data);
    }
    // UPLOAD/ REPLACE ANY FILES FOUND
    if (data.attachmentFile && data.attachmentType) {
      await handleUploadFile(data.attachmentFile, data.attachmentType);
    }
  };

  const handleDeleteDeployment = async () => {
    try {
      const deployment = deployments?.find((item) => item.device_id === deviceId);
      if (!deployment) {
        throw new Error('Invalid Deployment Data');
      }
      const critter = critters?.find((item) => item.critter_id === deployment?.critter_id);
      if (!critter) {
        throw new Error('Invalid Critter Data');
      }

      const found = telemetryContext.telemetryDataLoader.data?.find(
        (item) => item.deployment_id === deployment.deployment_id
      );
      if (!found) {
        await biohubApi.survey.removeDeployment(
          surveyContext.projectId,
          surveyContext.surveyId,
          critter.survey_critter_id,
          deployment.deployment_id
        );
        dialogContext.setYesNoDialog({ open: false });
        surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      } else {
        dialogContext.setYesNoDialog({ open: false });
        // Deployment is used in telemetry, do not delete until it is scrubbed
        throw new Error('Deployment is used in telemetry');
      }
    } catch (e) {
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              <strong>Error Deleting Deployment</strong>
            </Typography>
            <Typography variant="body2" component="div">
              {String(e)}
            </Typography>
          </>
        ),
        open: true
      });
    }
  };

  const deleteDeploymentDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Deployment?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete this deployment?
        </Typography>
      ),
      yesButtonLabel: 'Delete Deployment',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        handleDeleteDeployment();
      }
    });
  };

  const handleAddDeployment = async (data: AnimalDeployment) => {
    const payload = data as IAnimalTelemetryDevice & { critter_id: string };
    try {
      const critter = critters?.find((a) => a.survey_critter_id === data.survey_critter_id);

      if (!critter) {
        throw new Error('Invalid critter data');
      }
      data.critter_id = critter?.critter_id;
      await biohubApi.survey.addDeployment(
        surveyContext.projectId,
        surveyContext.surveyId,
        Number(data.survey_critter_id),
        payload
      );
      surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      // success snack bar
      dialogContext.setSnackbar({
        snackbarMessage: (
          <Typography variant="body2" component="div">
            Deployment Added
          </Typography>
        ),
        open: true
      });
    } catch (error) {
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              <strong>Error adding Deployment</strong>
            </Typography>
            <Typography variant="body2" component="div">
              {String(error)}
            </Typography>
          </>
        ),
        open: true
      });
    }
  };

  const handleEditDeployment = async (data: AnimalDeployment) => {
    try {
      await updateDeployments(data);
      await updateDevice(data);
      dialogContext.setSnackbar({
        snackbarMessage: (
          <Typography variant="body2" component="div">
            Deployment Updated
          </Typography>
        ),
        open: true
      });
    } catch (error) {
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              <strong>Error Deleting Sampling Site</strong>
            </Typography>
            <Typography variant="body2" component="div">
              {String(error)}
            </Typography>
          </>
        ),
        open: true
      });
    }
  };

  const updateDeployments = async (data: AnimalDeployment) => {
    for (const deployment of data.deployments ?? []) {
      const existingDeployment = deployments?.find((item) => item.deployment_id === deployment.deployment_id);
      if (
        !datesSameNullable(deployment?.attachment_start, existingDeployment?.attachment_start) ||
        !datesSameNullable(deployment?.attachment_end, existingDeployment?.attachment_end)
      ) {
        try {
          await biohubApi.survey.updateDeployment(
            surveyContext.projectId,
            surveyContext.surveyId,
            data.survey_critter_id,
            deployment
          );
        } catch (error) {
          throw new Error(`Failed to update deployment ${deployment.deployment_id}`);
        }
      }
    }
  };

  const updateDevice = async (data: AnimalDeployment) => {
    const existingDevice = critterDeployments.find((item) => item.deployment.device_id === data.device_id);
    const device = new Device({ ...data, collar_id: existingDevice?.deployment.collar_id });
    try {
      if (existingDevice && !_deepEquals(new Device(existingDevice.deployment), device)) {
        await telemetryApi.devices.upsertCollar(device);
      }
    } catch (error) {
      throw new Error(`Failed to update collar ${device.collar_id}`);
    }
  };

  const handleUploadFile = async (file?: File, attachmentType?: AttachmentType) => {
    try {
      if (file && attachmentType === AttachmentType.KEYX) {
        await biohubApi.survey.uploadSurveyKeyx(surveyContext.projectId, surveyContext.surveyId, file);
      } else if (file && attachmentType === AttachmentType.OTHER) {
        await biohubApi.survey.uploadSurveyAttachments(surveyContext.projectId, surveyContext.surveyId, file);
      }
    } catch (error) {
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              <strong>Error Uploading File</strong>
            </Typography>
            <Typography variant="body2" component="div">
              {`Failed to upload attachment ${file?.name}`}
            </Typography>
          </>
        ),
        open: true
      });
    }
  };

  return (
    <>
      <Menu
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setCritterId('');
          setDeviceId(0);
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <MenuItem
          onClick={() => {
            setFormMode(ANIMAL_FORM_MODE.EDIT);
            setShowDialog(true);
            setAnchorEl(null);
          }}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            deleteDeploymentDialog();
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
      <Formik
        initialValues={formData}
        enableReinitialize
        validationSchema={AnimalDeploymentSchema}
        validateOnBlur={false}
        validateOnChange={true}
        onSubmit={async (values, actions) => {
          setIsLoading(true);
          await handleSubmit(values);
          setIsLoading(false);
          setShowDialog(false);
          actions.resetForm();
          setCritterId('');
        }}>
        {(formikProps) => {
          return (
            <>
              <Dialog open={showDialog} fullScreen={fullScreen} maxWidth="xl">
                <DialogTitle>Critter Deployments</DialogTitle>
                <DialogContent>
                  <>
                    <FormControl
                      sx={{ width: '100%', marginBottom: 2 }}
                      variant="outlined"
                      fullWidth
                      error={Boolean(get(formikProps.errors, 'survey_critter_id'))}>
                      <InputLabel id="select-critter">Critter</InputLabel>
                      <Select
                        labelId="select-critter"
                        label={'Critter'}
                        value={critterId}
                        required
                        onChange={(e) => {
                          setCritterId(Number(e.target.value));
                          formikProps.setFieldValue(`survey_critter_id`, Number(e.target.value));
                        }}>
                        {critters?.map((item) => {
                          return (
                            <MenuItem key={item.survey_critter_id} value={item.survey_critter_id}>
                              <Box>
                                <Typography
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    typography: 'body2',
                                    fontWeight: 700,
                                    fontSize: '0.9rem'
                                  }}>
                                  {item.animal_id}
                                </Typography>
                                <Typography variant="subtitle2" color="textSecondary">
                                  {item.taxon} - {item.sex}
                                </Typography>
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </Select>
                      <FormHelperText>
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{
                            mt: '3px',
                            ml: '14px'
                          }}>
                          {get(formikProps.errors, 'survey_critter_id')}
                        </Typography>
                      </FormHelperText>
                    </FormControl>
                    <TelemetryDeviceForm mode={formMode} />
                  </>
                </DialogContent>
                <DialogActions>
                  <LoadingButton
                    color="primary"
                    variant="contained"
                    loading={isLoading}
                    onClick={() => {
                      formikProps.submitForm();
                    }}>
                    Save
                  </LoadingButton>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => {
                      setShowDialog(false);
                      formikProps.resetForm();
                      setCritterId('');
                      setDeviceId(0);
                      setFormData(defaultFormValues);
                    }}>
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>

              <Paper component={Stack} flexDirection="column" height="100%" overflow="hidden">
                <Toolbar
                  disableGutters
                  sx={{
                    flex: '0 0 auto',
                    pr: 3,
                    pl: 2
                  }}>
                  <Typography variant="h3" component="h2" flexGrow={1}>
                    Deployments &zwnj;
                    <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
                      ({critterDeployments?.length ?? 0})
                    </Typography>
                  </Typography>
                  <Button
                    sx={{
                      mr: -1
                    }}
                    variant="contained"
                    color="primary"
                    startIcon={<Icon path={mdiPlus} size={1} />}
                    onClick={() => {
                      setFormMode(ANIMAL_FORM_MODE.ADD);
                      setShowDialog(true);
                    }}>
                    Add
                  </Button>
                </Toolbar>
                <Divider flexItem></Divider>
                <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
                  <Box position="absolute" top="0" right="0" bottom="0" left="0">
                    {/* Display list of skeleton components while waiting for a response */}
                    {surveyContext.deploymentDataLoader.isLoading && <SkeletonListStack />}

                    {critterDeployments?.map((item) => (
                      <ManualTelemetryCard
                        key={`${item.deployment.device_id}:${item.deployment.attachment_start}`}
                        device_id={item.deployment.device_id}
                        name={String(item.critter.animal_id ?? item.critter.taxon)}
                        start_date={item.deployment.attachment_start}
                        end_date={item.deployment.attachment_end}
                        onMenu={(event, id) => {
                          handleMenuOpen(event, id);
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </>
          );
        }}
      </Formik>
    </>
  );
};

export default ManualTelemetryList;
