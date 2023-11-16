import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ListFader from 'components/loading/SkeletonList';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ManualTelemetryCard from './ManualTelemetryCard';

// export interface ManualTelemetryListProps {

const ManualTelemetryList = () => {
  const surveyContext = useContext(SurveyContext);

  useEffect(() => {
    surveyContext.critterDeploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  }, []);
  const deployments = useMemo(
    () => surveyContext.critterDeploymentDataLoader.data,
    [surveyContext.critterDeploymentDataLoader.data]
  );

  return (
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
          component={RouterLink}
          to={''}
          startIcon={<Icon path={mdiPlus} size={1} />}>
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
            <ManualTelemetryCard key={item.critter_id} name={item.alias} details={`Device ID: ${item.device_id}`} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ManualTelemetryList;
