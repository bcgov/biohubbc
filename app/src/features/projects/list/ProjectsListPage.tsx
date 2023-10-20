import { mdiFilterOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import ProjectsSubmissionAlertBar from 'components/publish/ProjectListSubmissionAlertBar';
import { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ProjectsListFilterForm from './ProjectsListFilterForm';
import ProjectsListTable from './ProjectsListTable';

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>

const useStyles = makeStyles((theme: Theme) => ({
  pageTitleContainer: {
    maxWidth: '170ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  pageTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
  },
  pageTitleActions: {
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75)
  },
  actionButton: {
    marginLeft: theme.spacing(1),
    minWidth: '6rem'
  },
  toolbarCount: {
    fontWeight: 400
  },
  filtersBox: {
    background: '#f7f8fa'
  }
}));

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsListPage: React.FC = () => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const codesContext = useContext(CodesContext);
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const projectsDataLoader = useDataLoader((filter?: IProjectAdvancedFilters) =>
    biohubApi.project.getProjectsList(filter)
  );
  projectsDataLoader.load();

  const draftsDataLoader = useDataLoader(() => biohubApi.draft.getDraftsList());
  draftsDataLoader.load();

  /**
   * Handle filtering project results.
   */
  const handleSubmit = async (filterValues: IProjectAdvancedFilters) => {
    projectsDataLoader.refresh(filterValues);
  };

  const handleReset = async () => {
    projectsDataLoader.refresh();
  };

  if (!codesContext.codesDataLoader.data || !projectsDataLoader.data || !draftsDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  /**
   * Displays project list.
   */
  return (
    <>
      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4}>
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.pageTitleContainer}>
                <Typography variant="h1" className={classes.pageTitle}>
                  Projects
                </Typography>
              </Box>
              <Box flex="0 0 auto" className={classes.pageTitleActions}>
                <SystemRoleGuard
                  validSystemRoles={[
                    SYSTEM_ROLE.SYSTEM_ADMIN,
                    SYSTEM_ROLE.PROJECT_CREATOR,
                    SYSTEM_ROLE.DATA_ADMINISTRATOR
                  ]}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Icon path={mdiPlus} size={1} />}
                    component={RouterLink}
                    to={'/admin/projects/create'}>
                    Create Project
                  </Button>
                </SystemRoleGuard>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>
      <Container maxWidth="xl">
        <Box py={3}>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
            <ProjectsSubmissionAlertBar projects={projectsDataLoader.data} />
          </SystemRoleGuard>
          <Paper elevation={0}>
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h4" component="h2">
                Records Found &zwnj;
                <Typography className={classes.toolbarCount} component="span" variant="inherit" color="textSecondary">
                  ({projectsDataLoader.data?.length || 0})
                </Typography>
              </Typography>
              <Button
                variant="text"
                color="primary"
                startIcon={<Icon path={mdiFilterOutline} size={0.8} />}
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                {!isFiltersOpen ? `Show Filters` : `Hide Filters`}
              </Button>
            </Toolbar>
            <Divider></Divider>
            {isFiltersOpen && <ProjectsListFilterForm handleSubmit={handleSubmit} handleReset={handleReset} />}
            <Box py={1} pb={2} px={3}>
              <ProjectsListTable
                projects={projectsDataLoader.data}
                drafts={draftsDataLoader.data}
                codes={codesContext.codesDataLoader.data}
              />
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ProjectsListPage;
