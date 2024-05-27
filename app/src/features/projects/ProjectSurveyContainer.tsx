import { mdiFolder, mdiListBoxOutline, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import ToggleButtonGroup from '@mui/lab/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import Toolbar from '@mui/material/Toolbar';
import SurveysListContainer from 'features/surveys/list/SurveysListContainer';
import { useState } from 'react';
import ProjectsListContainer from './list/ProjectsListContainer';

export enum ProjectSurveyViewEnum {
  PROJECTS = 'PROJECTS',
  SURVEYS = 'SURVEYS'
}

const buttonSx = {
  py: 0.5,
  px: 1.5,
  border: 'none',
  fontWeight: 700,
  borderRadius: '4px !important',
  fontSize: '0.875rem',
  letterSpacing: '0.02rem'
};

const ProjectSurveyContainer = () => {
  const [activeView, setActiveView] = useState<ProjectSurveyViewEnum>(ProjectSurveyViewEnum.PROJECTS);
  const [showSearch, setShowSearch] = useState(false);

  const views = [
    { value: ProjectSurveyViewEnum.PROJECTS, label: 'PROJECTS', icon: mdiFolder },
    { value: ProjectSurveyViewEnum.SURVEYS, label: 'SURVEYS', icon: mdiListBoxOutline }
  ];

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          value={activeView}
          onChange={(_, value) => {
            if (!value) {
              return;
            }
            return setActiveView(value);
          }}
          exclusive
          sx={{
            display: 'flex',
            gap: 1,
            '& Button': buttonSx
          }}>
          {views
            .filter((view) => [ProjectSurveyViewEnum.PROJECTS, ProjectSurveyViewEnum.SURVEYS].includes(view.value))
            .map((view) => (
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

        <Button
          color="primary"
          sx={buttonSx}
          onClick={() => setShowSearch(!showSearch)}
          component={Button}
          startIcon={<Icon path={mdiMagnify} size={1} />}>
          SEARCH
        </Button>
      </Toolbar>
      <Divider />
      {activeView === 'PROJECTS' && <ProjectsListContainer showSearch={showSearch} />}
      {activeView === 'SURVEYS' && <SurveysListContainer showSearch={showSearch} />}
    </>
  );
};

export default ProjectSurveyContainer;
