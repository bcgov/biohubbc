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
import { get } from 'lodash-es';
import { useContext, useEffect, useMemo, useState } from 'react';
import yup from 'utils/YupSchema';
import { ANIMAL_FORM_MODE } from '../view/survey-animals/animal';
import { AnimalTelemetryDeviceSchema } from '../view/survey-animals/telemetry-device/device';
import TelemetryDeviceForm from '../view/survey-animals/telemetry-device/TelemetryDeviceForm';
import ManualTelemetryCard from './ManualTelemetryCard';

// export interface ManualTelemetryListProps {
/*
1. Create new type to handle device that flattens the deployment? (no we might want to setup multiple later)
2. Create 
*/
export const AnimalDeploymentSchema = AnimalTelemetryDeviceSchema.shape({
  survey_critter_id: yup.number().required('An animal selection is required') // add survey critter id to form
});

const ManualTelemetryList = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const surveyContext = useContext(SurveyContext);
  const biohubApi = useBiohubApi();

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [critterId, setCritterId] = useState<number | string>('');
  const [deviceIndex, setDeviceIndex] = useState(0);

  useEffect(() => {
    surveyContext.critterDeploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  }, []);

  const deployments = useMemo(
    () => surveyContext.critterDeploymentDataLoader.data,
    [surveyContext.critterDeploymentDataLoader.data]
  );
  const critters = useMemo(() => surveyContext.critterDataLoader.data, [surveyContext.critterDataLoader.data]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, device_id: number) => {
    setAnchorEl(event.currentTarget);
    setDeviceIndex(Number(deployments?.findIndex((item) => item.device_id === device_id)));
  };

  const handleSubmit = async (survey_critter_id: number, data: any) => {
    // ADD NEW TELEMETRY
    await handleAddTelemetry(survey_critter_id, data);

    // EDIT TELEMETRY
    // TODO: add this

    // UPLOAD ANY FILES
    if (data.attachmentFile) {
      await handleUploadFile(data[deviceIndex].attachmentFile, data[deviceIndex].attachmentType);
    }
  };

  const handleAddTelemetry = async (survey_critter_id: number, data: any) => {
    const critter = critters?.find((a) => a.survey_critter_id === survey_critter_id);
    if (!critter) console.log('Did not find critter in addTelemetry!');

    data.critter_id = critter?.critter_id;
    try {
      await biohubApi.survey.addDeployment(surveyContext.projectId, surveyContext.surveyId, survey_critter_id, data);
      surveyContext.critterDeploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      // success snack bar
    } catch (error) {
      // error snack bar
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
            console.log('Edit clicked');
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
        initialValues={{
          survey_critter_id: '',
          deployments: [
            {
              deployment_id: '',
              attachment_start: '',
              attachment_end: undefined
            }
          ],
          device_id: '',
          device_make: '',
          device_model: '',
          frequency: '',
          frequency_unit: ''
        }}
        enableReinitialize
        validationSchema={AnimalDeploymentSchema}
        validateOnBlur={false}
        validateOnChange={true}
        onSubmit={async (values, actions) => {
          console.log('ON SUBMIT');
          setIsLoading(true);
          console.log(values);
          await handleSubmit(Number(values.survey_critter_id), values);
          setIsLoading(false);
          setShowDialog(false);
          actions.resetForm();
          setCritterId('');
        }}>
        {(formikProps) => (
          <>
            <Dialog
              open={showDialog}
              fullScreen={fullScreen}
              maxWidth="xl"
              onTransitionExited={() => {
                // if (formMode === ANIMAL_FORM_MODE.ADD) {
                //   formikArrayHelpers.remove(selectedIndex);
                // }
                // setFormMode(ANIMAL_FORM_MODE.EDIT);
              }}>
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
                  <TelemetryDeviceForm index={deviceIndex} mode={ANIMAL_FORM_MODE.ADD} />
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
                    // TODO: this needs to change
                    // need to use a new form
                    // new form needs to look for existing values based on ID
                    // form shouldn't really be based around index anymore
                    // need to change a bunch of things to account for that
                    // will also need to update the
                    console.log(formikProps.values);
                    // get the last index of the table
                    setDeviceIndex(0);
                    setShowDialog(true);
                    // AddEditAnimal: Line 244
                  }}>
                  Add
                </Button>
              </Toolbar>
              <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
                {/* Display list of skeleton components while waiting for a response */}
                <ListFader isLoading={surveyContext.critterDeploymentDataLoader.isLoading} />
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
                      name={item.alias}
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
