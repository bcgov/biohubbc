import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import { ListItemIcon, Menu, MenuItem, Select, useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
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
import ListFader from 'components/loading/SkeletonList';
import { AttachmentType } from 'constants/attachments';
import { SurveyContext } from 'contexts/surveyContext';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
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

const ManualTelemetryList = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const surveyContext = useContext(SurveyContext);
  const biohubApi = useBiohubApi();
  const telemetryApi = useTelemetryApi();

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formMode, setFormMode] = useState(ANIMAL_FORM_MODE.ADD);
  const [critterId, setCritterId] = useState<number | string>('');
  const [formData, setFormData] = useState<AnimalDeployment>({
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
  });

  useEffect(() => {
    surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  }, []);

  const deployments = useMemo(() => surveyContext.deploymentDataLoader.data, [surveyContext.deploymentDataLoader.data]);
  const critters = useMemo(() => surveyContext.critterDataLoader.data, [surveyContext.critterDataLoader.data]);

  const handleMenuOpen = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, device_id: number) => {
    setAnchorEl(event.currentTarget);
    const deployment = deployments?.find((item) => item.device_id === device_id);
    const deviceDetails = await telemetryApi.devices.getDeviceDetails(device_id);
    const critter = critters?.find((item) => item.critter_id === deployment?.critter_id);

    // need to map deployment back into object for initial values
    if (deployment) {
      const editData: AnimalDeployment = {
        survey_critter_id: Number(critter?.survey_critter_id),
        deployments: [
          {
            deployment_id: deployment.deployment_id,
            attachment_start: deployment.attachment_start,
            attachment_end: deployment.attachment_end
          }
        ],
        device_id: deployment.device_id,
        device_make: deviceDetails.device?.device_make ? String(deviceDetails.device?.device_make) : '',
        device_model: deviceDetails.device?.device_model ? String(deviceDetails.device?.device_model) : '',
        frequency: deviceDetails.device?.frequency ? Number(deviceDetails.device?.frequency) : undefined,
        frequency_unit: deviceDetails.device?.frequency_unit ? String(deviceDetails.device?.frequency_unit) : '',
        attachmentType: undefined,
        attachmentFile: undefined,
        critter_id: deployment.critter_id
      };
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

  const handleAddDeployment = async (data: AnimalDeployment) => {
    const critter = critters?.find((a) => a.survey_critter_id === data.survey_critter_id);
    if (!critter) console.log('Did not find critter in addTelemetry!');

    data.critter_id = critter?.critter_id;
    const payload = data as IAnimalTelemetryDevice & { critter_id: string };
    try {
      await biohubApi.survey.addDeployment(
        surveyContext.projectId,
        surveyContext.surveyId,
        Number(data.survey_critter_id),
        payload
      );
      surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      // success snack bar
    } catch (error) {
      // error snack bar
    }
  };

  const handleEditDeployment = async (data: AnimalDeployment) => {
    try {
      await updateDeployments(data);
      await updateDevice(data);
    } catch (error) {
      // error snack bar
    }
  };

  const updateDeployments = async (data: AnimalDeployment) => {
    for (const deployment of data.deployments || []) {
      const existingDeployment = deployments?.find((item) => item.deployment_id === deployment.deployment_id);
      if (
        !datesSameNullable(deployment?.attachment_start, existingDeployment?.attachment_start) ||
        !datesSameNullable(deployment?.attachment_end, existingDeployment?.attachment_end)
      ) {
        try {
          biohubApi.survey.updateDeployment(
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
    const existingDevice = deployments?.find((item) => item.device_id === data.device_id);
    const device = new Device({ ...data, collar_id: existingDevice?.collar_id });
    try {
      if (existingDevice && !_deepEquals(new Device(existingDevice), device)) {
        await telemetryApi.devices.upsertCollar(device);
      }
    } catch (error) {
      throw new Error(`Failed to update collar ${device.collar_id}`);
    }
  };

  const handleUploadFile = async (file?: File, attachmentType?: AttachmentType) => {};

  return (
    <>
      <Menu
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
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
        <MenuItem>
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
        {(formikProps) => (
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
                        return <MenuItem value={item.survey_critter_id}>{item.taxon}</MenuItem>;
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
                  }}>
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>

            <Box display="flex" flexDirection="column" height="100%">
              <Toolbar
                sx={{
                  flex: '0 0 auto'
                }}>
                <Typography
                  sx={{
                    flexGrow: '1',
                    fontSize: '1.125rem',
                    fontWeight: 700
                  }}>
                  Deployments &zwnj;
                  <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
                    ({deployments?.length ?? 0})
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
              <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
                {/* Display list of skeleton components while waiting for a response */}
                <ListFader isLoading={surveyContext.deploymentDataLoader.isLoading} />
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    p: 1,
                    background: grey[100]
                  }}>
                  {deployments?.map((item) => (
                    <ManualTelemetryCard
                      device_id={item.device_id}
                      name={'Animal'}
                      details={`Device ID: ${item.device_id}`}
                      onMenu={(event, id) => {
                        handleMenuOpen(event, id);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Formik>
    </>
  );
};

export default ManualTelemetryList;
