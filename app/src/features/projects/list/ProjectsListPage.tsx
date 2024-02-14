import { mdiFilterOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ProjectsListFilterForm from './ProjectsListFilterForm';
import ProjectsListTable from './ProjectsListTable';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';

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
  const projectsDataLoader = useDataLoader((filter?: IProjectAdvancedFilters) =>
    biohubApi.project.getProjectsList(filter)
  );

  const getProjectPrograms = (project: IGetProjectsListResponse) => {
    return (
      codesContext.codesDataLoader.data?.program
        .filter((code) => project.projectData.project_programs.includes(code.id))
        .map((code) => code.name)
        .join(', ') || ''
    );
  };


  codesContext.codesDataLoader.load();
  projectsDataLoader.load();

  /**
   * Handle filtering project results.
   */
  const handleSubmit = async (filterValues: IProjectAdvancedFilters) => {
    projectsDataLoader.refresh(filterValues);
  };

  const handleReset = async () => {
    projectsDataLoader.refresh();
  };

  /**
   * Displays project list.
   */
  return (
    <>
      <PageHeader
        title="Projects"
        buttonJSX={
          <SystemRoleGuard
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              component={RouterLink}
              to={'/admin/projects/create'}>
              Create Project
            </Button>
          </SystemRoleGuard>
        }
      />

      <Container maxWidth="xl">
        <Box py={3}>
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
                projects={projectsDataLoader.data?.map((projectResponse) => {
                  return {
                    ...projectResponse.projectData,
                    project_programs: getProjectPrograms(projectResponse)
                  }
                }) ?? []} />
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ProjectsListPage;
