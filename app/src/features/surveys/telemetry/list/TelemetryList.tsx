import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import useTheme from '@mui/material/styles/useTheme';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useOnMount } from '@mui/x-data-grid/internals';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { AttachmentType } from 'constants/attachments';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContext } from 'contexts/telemetryDataContext';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual as _deepEquals } from 'lodash';
import { get } from 'lodash-es';
import { useContext, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { datesSameNullable } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { InferType } from 'yup';
import { ANIMAL_FORM_MODE } from '../../view/survey-animals/animal';
import {
  AnimalTelemetryDeviceSchema,
  Device,
  IAnimalDeployment
} from '../../view/survey-animals/telemetry-device/device';
import TelemetryDeviceForm from '../../view/survey-animals/telemetry-device/TelemetryDeviceForm';
import { TelemetryListItem } from './TelemetryListItem';

export const AnimalDeploymentSchema = AnimalTelemetryDeviceSchema.shape({
  survey_critter_id: yup.number().required('An animal selection is required'), // add survey critter id to form
  critter_id: yup.string(),
  attachmentFile: yup.mixed(),
  attachmentType: yup.mixed<AttachmentType>().oneOf(Object.values(AttachmentType))
});
export type AnimalDeployment = InferType<typeof AnimalDeploymentSchema>;

export interface ICritterDeployment {
  critter: ISimpleCritterWithInternalId;
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
  const [checkboxSelectedIds, setCheckboxSelectedIds] = useState<string[]>([]);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | undefined>();

  console.log(selectedDeploymentId);

  useOnMount(() => {
    surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  });

  const deployments = surveyContext.deploymentDataLoader.data ?? [];
  const critters = surveyContext.critterDataLoader.data;

  const critterDeployments: ICritterDeployment[] = useMemo(() => {
    const data: ICritterDeployment[] = [];
    // combine all critter and deployments into a flat list
    deployments?.forEach((deployment) => {
      const critter = surveyContext.critterDataLoader.data?.find(
        (critter) => critter.critter_id === deployment.critter_id
      );
      if (critter) {
        data.push({ critter, deployment });
      }
    });
    return data;
  }, [surveyContext.critterDataLoader.data, deployments]);

  // const handleMenuOpen = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, device_id: number) => {
  //   setAnchorEl(event.currentTarget);
  //   setDeviceId(device_id);

  //   const critterDeployment = critterDeployments.find((item) => item.deployment.device_id === device_id);

  //   // need to map deployment back into object for initial values
  //   if (critterDeployment) {
  //     const deviceDetails = await telemetryApi.devices.getDeviceDetails(
  //       device_id,
  //       critterDeployment.deployment.device_make
  //     );
  //     const editData: AnimalDeployment = {
  //       survey_critter_id: Number(critterDeployment.critter?.survey_critter_id),
  //       deployments: [
  //         {
  //           deployment_id: critterDeployment.deployment.deployment_id,
  //           attachment_start: dayjs(critterDeployment.deployment.attachment_start).format('YYYY-MM-DD'),
  //           attachment_end: critterDeployment.deployment.attachment_end
  //             ? dayjs(critterDeployment.deployment.attachment_end).format('YYYY-MM-DD')
  //             : null
  //         }
  //       ],
  //       device_id: critterDeployment.deployment.device_id,
  //       device_make: deviceDetails.device?.device_make ? String(deviceDetails.device?.device_make) : '',
  //       device_model: deviceDetails.device?.device_model ? String(deviceDetails.device?.device_model) : '',
  //       frequency: deviceDetails.device?.frequency ? Number(deviceDetails.device?.frequency) : undefined,
  //       frequency_unit: deviceDetails.device?.frequency_unit ? String(deviceDetails.device?.frequency_unit) : '',
  //       attachmentType: undefined,
  //       attachmentFile: undefined,
  //       critter_id: critterDeployment.deployment.critter_id
  //     };
  //     setCritterId(critterDeployment.critter?.survey_critter_id);
  //     setFormData(editData);
  //   }
  // };

  const handleSampleSiteMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, deploymentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeploymentId(deploymentId);
  };

  const handleCheckboxChange = (deploymentId: string) => {
    setCheckboxSelectedIds((prev) => {
      if (prev.includes(deploymentId)) {
        return prev.filter((item) => item !== deploymentId);
      } else {
        return [...prev, deploymentId];
      }
    });
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
    try {
      const critter = critters?.find((a) => a.survey_critter_id === data.survey_critter_id);

      if (!critter) {
        throw new Error('Invalid critter data');
      }

      // await biohubApi.survey.addDeployment(
      //   surveyContext.projectId,
      //   surveyContext.surveyId,
      //   Number(data.survey_critter_id),
      //   //Being explicit here for simplicity.
      //   {
      //     critter_id: critter.critter_id,
      //     device_id: data.device_id,
      //     device_make: data.device_make ?? undefined,
      //     frequency: data.frequency ?? undefined,
      //     frequency_unit: data.frequency_unit ?? undefined,
      //     device_model: data.device_model ?? undefined,
      //     attachment_start: data.deployments?.[0].attachment_start,
      //     attachment_end: data.deployments?.[0].attachment_end ?? undefined
      //   }
      // );
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

  const deploymentCount = deployments?.length ?? 0;

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
                        value={String(critterId)}
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
                                  {item.itis_scientific_name} - {item.sex}
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

              <Paper
                component={Stack}
                flexDirection="column"
                height="100%"
                sx={{
                  overflow: 'hidden'
                }}>
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
                      ({deploymentCount ?? 0})
                    </Typography>
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to={'deployment/create'}
                    startIcon={<Icon path={mdiPlus} size={1} />}>
                    Add
                  </Button>
                  <IconButton
                    edge="end"
                    sx={{
                      ml: 1
                    }}
                    aria-label="header-settings"
                    disabled={!checkboxSelectedIds.length}
                    // onClick={handleHeaderMenuClick} // BULK ACTIONS BUTTON
                    title="Bulk Actions">
                    <Icon path={mdiDotsVertical} size={1} />
                  </IconButton>
                </Toolbar>
                <Divider flexItem />
                <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
                  <Box position="absolute" top="0" right="0" bottom="0" left="0">
                    {surveyContext.deploymentDataLoader.isLoading ? (
                      <SkeletonList />
                    ) : (
                      <Stack height="100%" position="relative" sx={{ overflowY: 'auto' }}>
                        <Box flex="0 0 auto" display="flex" alignItems="center" px={2} height={55}>
                          <FormGroup>
                            <FormControlLabel
                              label={
                                <Typography
                                  variant="body2"
                                  component="span"
                                  color="textSecondary"
                                  fontWeight={700}
                                  sx={{ textTransform: 'uppercase' }}>
                                  Select All
                                </Typography>
                              }
                              control={
                                <Checkbox
                                  sx={{
                                    mr: 0.75
                                  }}
                                  checked={
                                    checkboxSelectedIds.length > 0 && checkboxSelectedIds.length === deploymentCount
                                  }
                                  indeterminate={
                                    checkboxSelectedIds.length >= 1 && checkboxSelectedIds.length < deploymentCount
                                  }
                                  onClick={() => {
                                    if (checkboxSelectedIds.length === deploymentCount) {
                                      setCheckboxSelectedIds([]);
                                      return;
                                    }

                                    const deploymentIds = deployments.map((deployment) => deployment.deployment_id);
                                    setCheckboxSelectedIds(deploymentIds);
                                  }}
                                  inputProps={{ 'aria-label': 'controlled' }}
                                />
                              }
                            />
                          </FormGroup>
                        </Box>
                        <Divider flexItem></Divider>
                        <Box
                          flex="1 1 auto"
                          sx={{
                            background: grey[100]
                          }}>
                          {/* Display text if the sample site data loader has no items in it */}
                          {!deploymentCount && (
                            <Stack
                              sx={{
                                background: grey[100]
                              }}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flex="1 1 auto"
                              position="absolute"
                              top={0}
                              right={0}
                              left={0}
                              bottom={0}
                              height="100%">
                              <Typography variant="body2">No Sampling Sites</Typography>
                            </Stack>
                          )}

                          {deployments.map((deployment) => {
                            return (
                              // <SamplingSiteListSite
                              //   deployment={deployment}
                              //   isChecked={checkboxSelectedIds.includes(deployment.survey_sample_site_id)}
                              //   handledeploymentMenuClick={handledeploymentMenuClick}
                              //   handleCheckboxChange={handleCheckboxChange}
                              //   key={`${deployment.survey_sample_site_id}-${deployment.name}`}
                              // />
                              <TelemetryListItem
                                deployment={deployment}
                                isChecked={checkboxSelectedIds.includes(deployment.deployment_id)}
                                handleDeploymentMenuClick={handleSampleSiteMenuClick}
                                handleCheckboxChange={handleCheckboxChange}
                                key={deployment.deployment_id}
                              />
                            );
                          })}
                        </Box>
                        {/* TODO how should we handle controlling pagination? */}
                        {/* <Paper square sx={{ position: 'sticky', bottom: 0, marginTop: '-1px' }}>
                <Divider flexItem></Divider>
                  <TablePagination
                    rowsPerPage={10}
                    page={1}
                    onPageChange={(event) => {}}
                    rowsPerPageOptions={[10, 50]}
                    count={69}
                  />
                </Paper> */}
                      </Stack>
                    )}
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
