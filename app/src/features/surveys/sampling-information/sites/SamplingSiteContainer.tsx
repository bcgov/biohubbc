import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useSamplingSiteStaticLayer } from 'features/surveys/view/survey-spatial/components/map/useSamplingSiteStaticLayer';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { useSurveyContext } from 'hooks/useContext';
import { Link as RouterLink } from 'react-router-dom';
import { SamplingSiteTableContainer } from './table/SamplingSiteTableContainer';

/**
 * Component for managing sampling sites, methods, and periods.
 * Returns a map and data grids displaying sampling information.
 *
 * @returns {*}
 */
const SamplingSiteContainer = () => {
  const surveyContext = useSurveyContext();

  const samplingSiteStaticLayer = useSamplingSiteStaticLayer();

  return (
    <>
      <Toolbar sx={{ flex: '0 0 auto', pr: 3, pl: 2 }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Sampling Sites
        </Typography>
        <Button
          variant="contained"
          color="primary"
          disabled={Boolean(!surveyContext.techniqueDataLoader.data?.count)}
          component={RouterLink}
          to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling/create`}
          startIcon={<Icon path={mdiPlus} size={0.8} />}>
          Add
        </Button>
      </Toolbar>

      <Divider flexItem />

      <Box height="400px" flex="1 1 auto">
        <SurveyMap staticLayers={[samplingSiteStaticLayer]} isLoading={false} />
      </Box>

      <SamplingSiteTableContainer />
    </>
  );
};

export default SamplingSiteContainer;
