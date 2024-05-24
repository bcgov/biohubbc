import { mdiCog } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ComponentDialog from 'components/dialog/ComponentDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { ProjectRoleGuard } from 'components/security/Guards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import NoSurveySectionData from '../components/NoSurveySectionData';
import { SurveyAnimalsTable } from './survey-animals/SurveyAnimalsTable';
import TelemetryMap from './survey-animals/telemetry-device/TelemetryMap';

const SurveyAnimals: React.FC = () => {
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const surveyContext = useContext(SurveyContext);
  const history = useHistory();

  const [openRemoveCritterDialog, setOpenRemoveCritterDialog] = useState(false);
  const [openViewTelemetryDialog, setOpenViewTelemetryDialog] = useState(false);
  const [selectedCritterId, setSelectedCritterId] = useState<number | null>(null);

  const { projectId, surveyId } = surveyContext;
  const {
    refresh: refreshCritters,
    load: loadCritters,
    data: critterData
  } = useDataLoader(() => biohubApi.survey.getSurveyCritters(projectId, surveyId));

  const { load: loadDeployments, data: deploymentData } = useDataLoader(() =>
    biohubApi.survey.getDeploymentsInSurvey(projectId, surveyId)
  );

  if (!critterData) {
    loadCritters();
  }

  const currentCritterbaseCritterId = useMemo(
    () => critterData?.find((a) => a.survey_critter_id === selectedCritterId)?.critter_id,
    [critterData, selectedCritterId]
  );

  if (!deploymentData) {
    loadDeployments();
  }

  const {
    refresh: refreshTelemetry,
    data: telemetryData,
    isLoading: telemetryLoading
  } = useDataLoader(() =>
    biohubApi.survey.getCritterTelemetry(
      projectId,
      surveyId,
      selectedCritterId ?? 0,
      '1970-01-01',
      new Date().toISOString()
    )
  );

  useEffect(() => {
    if (currentCritterbaseCritterId) {
      refreshTelemetry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCritterbaseCritterId]);

  const setPopup = (message: string) => {
    dialogContext.setSnackbar({
      open: true,
      snackbarMessage: (
        <Typography variant="body2" component="div">
          {message}
        </Typography>
      )
    });
  };

  const handleRemoveCritter = async () => {
    try {
      if (!selectedCritterId) {
        setPopup('Failed to remove critter from survey.');
        return;
      }
      await biohubApi.survey.removeCrittersFromSurvey(projectId, surveyId, [selectedCritterId]);
    } catch (e) {
      setPopup('Failed to remove critter from survey.');
    }
    setOpenRemoveCritterDialog(false);
    refreshCritters();
  };

  return (
    <Box>
      <YesNoDialog
        dialogTitle={'Remove critter from survey?'}
        dialogText={`Are you sure you would like to remove this critter from the survey?
          The critter will remain present in Critterbase, but will no longer appear in the survey list.`}
        open={openRemoveCritterDialog}
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel="Delete"
        noButtonLabel="Cancel"
        onClose={() => setOpenRemoveCritterDialog(false)}
        onNo={() => setOpenRemoveCritterDialog(false)}
        onYes={handleRemoveCritter}
      />
      <Toolbar>
        <Typography
          component="h2"
          variant="h4"
          sx={{
            flex: '1 1 auto'
          }}>
          Animals
        </Typography>
        <ProjectRoleGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <Button
            component={RouterLink}
            to={`animals/`}
            title="Manage Animals"
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiCog} size={0.75} />}
            sx={{
              my: -1
            }}>
            Manage Animals
          </Button>
        </ProjectRoleGuard>
      </Toolbar>
      <Divider flexItem></Divider>
      <Box p={2}>
        {critterData?.length ? (
          <SurveyAnimalsTable
            animalData={critterData}
            deviceData={deploymentData}
            onMenuOpen={setSelectedCritterId}
            onRemoveCritter={() => {
              setOpenRemoveCritterDialog(true);
            }}
            onEditCritter={() => {
              history.push(`animals/?critter_id=${selectedCritterId}`);
            }}
            onMapOpen={() => {
              setOpenViewTelemetryDialog(true);
            }}
          />
        ) : (
          <NoSurveySectionData text={'No Animals'} />
        )}
      </Box>
      <ComponentDialog
        dialogProps={{ fullScreen: !!telemetryData?.points?.features?.length, maxWidth: false }}
        dialogTitle={'View Telemetry'}
        open={openViewTelemetryDialog}
        onClose={() => setOpenViewTelemetryDialog(false)}>
        {telemetryData?.points.features.length ? (
          <TelemetryMap
            telemetryData={telemetryData}
            deploymentData={deploymentData?.filter((a) => a.critter_id === currentCritterbaseCritterId)}
          />
        ) : (
          <Typography>
            {telemetryLoading
              ? 'Loading telemetry...'
              : "No telemetry has been collected for this animal's deployments."}
          </Typography>
        )}
      </ComponentDialog>
    </Box>
  );
};
export default SurveyAnimals;
