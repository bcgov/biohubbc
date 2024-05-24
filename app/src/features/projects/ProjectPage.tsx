import { mdiFolder, mdiListBoxOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import PageHeader from 'components/layout/PageHeader';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ProjectsListPage from './list/ProjectsListContainer';

export enum ProjectsPageViewEnum {
  PROJECTS = 'PROJECTS',
  SURVEYS = 'SURVEYS'
}

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsPage = () => {
  const [activeView, setActiveView] = useState<ProjectsPageViewEnum>();

  const views = [
    { value: ProjectsPageViewEnum.PROJECTS, label: 'PROJECTS', icon: mdiFolder },
    { value: ProjectsPageViewEnum, label: 'SURVEYS', icon: mdiListBoxOutline }
  ];

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

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper>
          <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <ToggleButtonGroup
              value={activeView}
              onChange={(_, value) => setActiveView(value)}
              exclusive
              sx={{
                display: 'flex',
                gap: 1,
                '& Button': {
                  py: 0.25,
                  px: 1.5,
                  border: 'none',
                  borderRadius: '4px !important',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  letterSpacing: '0.02rem'
                }
              }}>
              {views.map((view) => (
                <ToggleButton
                  key={view.label}
                  component={Button}
                  color="primary"
                  startIcon={<Icon path={view.icon} size={0.75} />}
                  value={view.value}>
                  {view.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Toolbar>
          <Divider />
          {activeView === 'PROJECTS' && <ProjectsListPage />}
        </Paper>
      </Container>
    </>
  );
};

export default ProjectsPage;
