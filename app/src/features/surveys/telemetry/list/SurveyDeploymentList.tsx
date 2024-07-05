import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
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
import grey from '@mui/material/colors/grey';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SurveyDeploymentListItem } from './SurveyDeploymentListItem';

const SurveyDeploymentList = () => {
  const { projectId, surveyId } = useContext(SurveyContext);

  const biohubApi = useBiohubApi();
  // const critterbaseApi = useCritterbaseApi();

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const [checkboxSelectedIds, setCheckboxSelectedIds] = useState<number[]>([]);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<number | null>();
  const surveyContext = useSurveyContext();

  const deploymentsDataLoader = useDataLoader(() => biohubApi.survey.getDeploymentsInSurvey(projectId, surveyId));

  // Fetch captures associated with the deployments
  // const capturesDataLoader = useDataLoader((captureIds: string[]) => critterbaseApi.capture.getCaptures(captureIds))

  useEffect(() => {
    deploymentsDataLoader.load();
  }, []);

  const deployments = deploymentsDataLoader.data ?? [];

  // useEffect(() => {
  //   if (deploymentsDataLoader.data){
  //   capturesDataLoader.load()};
  // }, [deploymentsDataLoader.data]);

  const handledDeploymentMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, deploymentId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeploymentId(deploymentId);
  };

  const handleCheckboxChange = (deploymentId: number) => {
    setCheckboxSelectedIds((prev) => {
      if (prev.includes(deploymentId)) {
        return prev.filter((item) => item !== deploymentId);
      } else {
        return [...prev, deploymentId];
      }
    });
  };

  // const handleDelete = () => {}

  // const handleEdit = () => {redirect based on selectedDeployment}

  const deploymentCount = deployments?.length ?? 0;

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
          to={`/admin/projects/${projectId}/surveys/${surveyId}/telemetry/deployment/${selectedDeploymentId}/edit`}
          onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
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
            {deploymentsDataLoader.isLoading ? (
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
                <Divider flexItem></Divider>
                <Box
                  flex="1 1 auto"
                  sx={{
                    background: grey[100]
                  }}>
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
                      <Typography variant="body2">No Deployments</Typography>
                    </Stack>
                  )}

                  {deployments.map((deployment) => {
                    const animal = surveyContext.critterDataLoader.data?.find(
                      (animal) => animal.critter_id === deployment.critterbase_critter_id
                    );
                    if (animal) {
                      return (
                        <SurveyDeploymentListItem
                          key={deployment.deployment_id}
                          animal={animal}
                          deployment={deployment}
                          isChecked={checkboxSelectedIds.includes(deployment.deployment_id)}
                          handleDeploymentMenuClick={handledDeploymentMenuClick}
                          handleCheckboxChange={handleCheckboxChange}
                        />
                      );
                    }
                  })}
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default SurveyDeploymentList;
