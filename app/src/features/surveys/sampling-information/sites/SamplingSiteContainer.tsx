import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
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

      {/* <SamplingSiteMapContainer /> */}

      <SamplingSiteTableContainer />
    </>
  );
};

export default SamplingSiteContainer;
