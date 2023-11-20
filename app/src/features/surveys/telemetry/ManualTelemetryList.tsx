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
import { SurveyContext } from 'contexts/surveyContext';
import { Formik } from 'formik';
import { get } from 'lodash-es';
import { useContext, useEffect, useMemo, useState } from 'react';
import yup from 'utils/YupSchema';
import { ANIMAL_FORM_MODE } from '../view/survey-animals/animal';
import { AnimalTelemetryDeviceSchema } from '../view/survey-animals/telemetry-device/device';
import TelemetryDeviceFormContent from '../view/survey-animals/telemetry-device/TelemetryDeviceFormContent';
import ManualTelemetryCard from './ManualTelemetryCard';

// export interface ManualTelemetryListProps {

const AnimalDeploymentSchema = yup.object().shape({
  device: yup
    .array()
    .of(
      AnimalTelemetryDeviceSchema.shape({
        survey_critter_id: yup.number().required('An animal selection is required') // add survey critter id to form
      })
    )
    .required()
});

const ManualTelemetryList = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const surveyContext = useContext(SurveyContext);

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
  const blankDevice = {
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
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, device_id: number) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSubmit = () => {
    console.log('HANDLE SUBMIT NEEDS TO DO STUFF');
  };
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
        <MenuItem onClick={() => {
          console.log("Edit clicked")
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
          device: [
            {
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
            }
          ]
        }}
        enableReinitialize
        validationSchema={AnimalDeploymentSchema}
        validateOnBlur={false}
        validateOnChange={true}
        onSubmit={async (values, actions) => {
          console.log(values);
          console.log(actions);

          setIsLoading(true);
          handleSubmit();
          // handleCritterSave
        }}>
        {(formikProps) => (
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
                <FormControl sx={{ width: '100%', marginBottom: 2 }}>
                  <InputLabel id="select-critter">Critter</InputLabel>
                  <Select
                    labelId="select-critter"
                    label={'Critter'}
                    value={critterId}
                    onChange={(e) => {
                      setCritterId(Number(e.target.value));
                      formikProps.setFieldValue(`device[${deviceIndex}].survey_critter_id`, Number(e.target.value));
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
                      {get(formikProps.errors.device?.[deviceIndex], 'survey_critter_id')}
                    </Typography>
                  </FormHelperText>
                </FormControl>
                <TelemetryDeviceFormContent index={deviceIndex} mode={ANIMAL_FORM_MODE.ADD} />
              </>
            </DialogContent>
            <DialogActions>
              <LoadingButton
                color="primary"
                variant="contained"
                loading={isLoading}
                onClick={() => {
                  console.log(formikProps.values);
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
        )}
      </Formik>
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
  );
};

export default ManualTelemetryList;
