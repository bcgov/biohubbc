import { mdiFilterOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
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

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsListPage: React.FC = () => {
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
      <Paper
        square
        elevation={0}
        sx={{
          borderBottom: '1px solid' + grey[300]
        }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, lg: 4 } }}>
          <Stack
            alignItems="flex-start"
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            gap={1}>
            <Typography
              variant="h1"
              sx={{
                ml: '-2px'
              }}>
              Projects
            </Typography>
            <Stack flexDirection="row" alignItems="center" gap={1}>
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
            </Stack>
          </Stack>
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
                <Typography
                  component="span"
                  color="textSecondary"
                  lineHeight="inherit"
                  fontSize="inherit"
                  fontWeight={400}>
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
