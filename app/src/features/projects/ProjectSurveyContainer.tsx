import { mdiFolder, mdiListBoxOutline, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import SurveysListContainer from 'features/surveys/list/SurveysListContainer';
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import ProjectsListContainer from './list/ProjectsListContainer';

export enum ProjectSurveyViewEnum {
  projects = 'projects',
  surveys = 'surveys'
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

interface IProjectSurveyContainerProps {
  params: URLSearchParams;
  viewParam: string;
}

const ProjectSurveyContainer = (props: IProjectSurveyContainerProps) => {
  const { params, viewParam } = props;
  const history = useHistory();
  const location = useLocation();

  const [showSearch, setShowSearch] = useState(false);
  const [activeView, setActiveView] = useState<string>(params.get(viewParam) ?? ProjectSurveyViewEnum.projects);

  // Lowercase enums for the URL string to be lowercase
  const views = [
    { value: ProjectSurveyViewEnum.projects, label: 'projects', icon: mdiFolder },
    { value: ProjectSurveyViewEnum.surveys, label: 'surveys', icon: mdiListBoxOutline }
  ];

  const handleToggleChange = (_: React.MouseEvent<HTMLElement, MouseEvent>, value: ProjectSurveyViewEnum) => {
    if (!value) {
      return;
    }

    // Update the value of the viewParam in the cloned params
    params.set(viewParam, value);

    setActiveView(value);

    // Push the new URL with updated params to the browser history
    history.push({
      pathname: location.pathname,
      search: params.toString()
    });
  };

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          value={activeView}
          onChange={handleToggleChange}
          exclusive
          sx={{
            display: 'flex',
            gap: 1,
            '& Button': buttonSx
          }}>
          {views
            .filter((view) => [ProjectSurveyViewEnum.projects, ProjectSurveyViewEnum.surveys].includes(view.value))
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
      {activeView === ProjectSurveyViewEnum.projects && (
        <ProjectsListContainer showSearch={showSearch} />
      )}
      {activeView === ProjectSurveyViewEnum.surveys && <SurveysListContainer showSearch={showSearch}/>}
    </>
  );
};

export default ProjectSurveyContainer;
