import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { TelemetryDeviceKeysButton } from 'features/surveys/telemetry/device-keys/TelemetryDeviceKeysButton';
import { SurveyDeploymentListItem } from 'features/surveys/telemetry/list/SurveyDeploymentListItem';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Renders a list of all deployments in the survey
 *
 * @returns {*}
 */
export const SurveyDeploymentList = () => {
  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();
  const telemetryDataContext = useTelemetryDataContext();

  const biohubApi = useBiohubApi();

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const [checkboxSelectedIds, setCheckboxSelectedIds] = useState<number[]>([]);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<number | null>();

  const frequencyUnitDataLoader = useDataLoader(() => biohubApi.telemetry.getCodeValues('frequency_unit'));
  const deviceMakesDataLoader = useDataLoader(() => biohubApi.telemetry.getCodeValues('device_make'));

  const deploymentsDataLoader = telemetryDataContext.deploymentsDataLoader;
  const deployments = deploymentsDataLoader.data ?? [];
  const deploymentCount = deployments?.length ?? 0;

  useEffect(() => {
    frequencyUnitDataLoader.load();
    deviceMakesDataLoader.load();
    deploymentsDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [
    deploymentsDataLoader,
    deviceMakesDataLoader,
    frequencyUnitDataLoader,
    surveyContext.projectId,
    surveyContext.surveyId
  ]);

  /**
   * Callback for when a deployment action menu is clicked.
   *
   * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event
   * @param {number} deploymentId
   */
  const handledDeploymentMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, deploymentId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeploymentId(deploymentId);
  };

  /**
   * Callback for when a checkbox is toggled.
   *
   * @param {number} deploymentId
   */
  const handleCheckboxChange = (deploymentId: number) => {
    setCheckboxSelectedIds((prev) => {
      if (prev.includes(deploymentId)) {
        return prev.filter((item) => item !== deploymentId);
      } else {
        return [...prev, deploymentId];
      }
    });
  };

  /**
   * Callback for when the delete deployment action is confirmed.
   */
  const handleDeleteDeployment = async () => {
    await biohubApi.survey
      .deleteDeployment(surveyContext.projectId, surveyContext.surveyId, Number(selectedDeploymentId))
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setAnchorEl(null);
        deploymentsDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Deployment</strong>
              </Typography>
              <Typography variant="body2" component="div">
                {String(error)}
              </Typography>
            </>
          ),
          open: true
        });
      });
  };

  /**
   * Display the delete deployment confirmation dialog.
   */
  const renderDeleteDeploymentDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Deployment?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete this deployment? All telemetry data from the deployment will also be
          permanently deleted.
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

  return (
    <>
      <Menu
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
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
          component={RouterLink}
          to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry/deployment/${selectedDeploymentId}/edit`}
          onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            renderDeleteDeploymentDialog();
            setAnchorEl(null);
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

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
            gap: 1,
            pr: 3,
            pl: 2
          }}>
          <Typography variant="h3" component="h2" flexGrow={1}>
            Deployments &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({deploymentCount})
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

          <TelemetryDeviceKeysButton />

          <IconButton
            edge="end"
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
            <LoadingGuard
              isLoading={deploymentsDataLoader.isLoading}
              isLoadingFallback={<SkeletonList />}
              isLoadingFallbackDelay={100}
              hasNoData={!deploymentCount}
              hasNoDataFallback={
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
                  <Typography variant="body2">No Deployments</Typography>
                </Stack>
              }
              hasNoDataFallbackDelay={100}>
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
                          checked={checkboxSelectedIds.length > 0 && checkboxSelectedIds.length === deploymentCount}
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
                <Divider flexItem />
                <Stack
                  flex="1 1 auto"
                  sx={{
                    background: grey[100]
                  }}>
                  {deployments.map((deployment) => {
                    const animal = surveyContext.critterDataLoader.data?.find(
                      (animal) => animal.critterbase_critter_id === deployment.critterbase_critter_id
                    );

                    if (!animal) {
                      return null;
                    }

                    // Replace the deployment frequency_unit IDs with their human readable codes
                    const hydratedDeployment = {
                      ...deployment,
                      frequency_unit:
                        frequencyUnitDataLoader.data?.find(
                          (frequencyUnitOption) => frequencyUnitOption.id === deployment.frequency_unit
                        )?.code ?? null
                    };

                    return (
                      <SurveyDeploymentListItem
                        key={deployment.deployment_id}
                        animal={animal}
                        deployment={hydratedDeployment}
                        isChecked={checkboxSelectedIds.includes(deployment.deployment_id)}
                        handleDeploymentMenuClick={handledDeploymentMenuClick}
                        handleCheckboxChange={handleCheckboxChange}
                      />
                    );
                  })}
                </Stack>
              </Stack>
            </LoadingGuard>
          </Box>
        </Box>
      </Paper>
    </>
  );
};