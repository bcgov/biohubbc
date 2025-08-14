import { mdiArrowTopRight, mdiCog, mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { SurveyDeploymentListItem } from 'features/surveys/telemetry/list/SurveyDeploymentListItem';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Renders a list of all deployments in the survey
 *
 * @returns {*}
 */
export const SurveyDeploymentList = () => {
  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const [deploymentAnchorEl, setDeploymentAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<number | null>();

  const deploymentDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions) =>
    biohubApi.telemetryDeployment.getDeploymentsInSurvey(surveyContext.surveyId, pagination)
  );

  const deployments = deploymentDataLoader.data?.deployments ?? [];
  const deploymentsCount = deploymentDataLoader.data?.count ?? 0;

  /**
   * Load the deployments and telemetry data when the page is initially loaded.
   */
  useEffect(() => {
    deploymentDataLoader.load();
  }, [deploymentDataLoader]);

  /**
   * Callback for when a deployment action menu is clicked.
   *
   * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event
   * @param {number} deploymentId
   */
  const handledDeploymentMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, deploymentId: number) => {
    setSelectedDeploymentId(deploymentId);
    setDeploymentAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Menu
        open={Boolean(deploymentAnchorEl)}
        onClose={() => {
          setDeploymentAnchorEl(null);
        }}
        anchorEl={deploymentAnchorEl}
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
          to={`/admin/surveys/${surveyContext.surveyId}/telemetry/manage/deployment/${selectedDeploymentId}/edit`}
          onClick={() => setDeploymentAnchorEl(null)}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to={`/admin/surveys/${surveyContext.surveyId}/telemetry/manage/`}
          onClick={() => {
            setDeploymentAnchorEl(null);
          }}>
          <ListItemIcon>
            <Icon path={mdiCog} size={1} />
          </ListItemIcon>
          Manage
        </MenuItem>
      </Menu>

      <Stack
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
          <Typography variant="h3" component="h2" flexGrow={1} sx={{ ml: 1.5 }}>
            Deployments &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({deploymentsCount})
            </Typography>
          </Typography>

          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={`/admin/surveys/${surveyContext.surveyId}/telemetry/manage/`}
            startIcon={<Icon path={mdiCog} size={0.75} />}>
            Manage
          </Button>
        </Toolbar>
        <Divider flexItem />
        <LoadingGuard
          isLoading={
            !deploymentDataLoader.data?.deployments && (deploymentDataLoader.isLoading || !deploymentDataLoader.isReady)
          }
          isLoadingFallback={<SkeletonList />}
          isLoadingFallbackDelay={100}
          hasNoData={!deploymentsCount}
          hasNoDataFallback={
            <NoDataOverlay
              minHeight="400px"
              title="Add Deployments"
              subtitle="Observations show where and when you observed species. You can link observations to sampling periods."
              icon={mdiArrowTopRight}
            />
          }
          hasNoDataFallbackDelay={100}>
          <Stack height="100%" position="relative" sx={{ overflowY: 'auto' }}>
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

                // Replace the deployment frequency_unit IDs with their human readable codes
                const hydratedDeployment = {
                  ...deployment,
                  frequency_unit:
                    codesContext.codesDataLoader.data?.frequency_units.find(
                      (frequencyUnit) => frequencyUnit.id === deployment.frequency_unit_id
                    )?.name ?? null
                };

                return (
                  <SurveyDeploymentListItem
                    key={deployment.deployment_id}
                    animal={animal}
                    deployment={hydratedDeployment}
                    handleDeploymentMenuClick={handledDeploymentMenuClick}
                  />
                );
              })}
            </Stack>
          </Stack>
        </LoadingGuard>
      </Stack>
    </>
  );
};
