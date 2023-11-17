import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ListFader from 'components/loading/SkeletonList';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ANIMAL_FORM_MODE } from '../view/survey-animals/animal';
import TelemetryDeviceFormContent from '../view/survey-animals/telemetry-device/TelemetryDeviceFormContent';
import ManualTelemetryCard from './ManualTelemetryCard';

// export interface ManualTelemetryListProps {

const ManualTelemetryList = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const surveyContext = useContext(SurveyContext);

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    surveyContext.critterDeploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  }, []);
  const deployments = useMemo(
    () => surveyContext.critterDeploymentDataLoader.data,
    [surveyContext.critterDeploymentDataLoader.data]
  );

  return (
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
        <DialogTitle>Butts</DialogTitle>
        <DialogContent>
          <TelemetryDeviceFormContent index={0} mode={ANIMAL_FORM_MODE.ADD} />
        </DialogContent>
        <DialogActions>
          <LoadingButton
            color="primary"
            variant="contained"
            onClick={async () => {
              // section is always going to be telemetry
              // await handleSaveTelemetry(values);
              // submitForm();
              // setFormMode(ANIMAL_FORM_MODE.EDIT);
              setShowDialog(false);
            }}
            loading={false}>
            Save
          </LoadingButton>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => {
              setShowDialog(false);
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
              setShowDialog(true);
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
              <ManualTelemetryCard name={item.alias} details={`Device ID: ${item.device_id}`} />
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ManualTelemetryList;
