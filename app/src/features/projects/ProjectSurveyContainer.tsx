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

interface IProjectSurveyContainerProps {
  params: URLSearchParams;
  viewParam: string;
}

const ProjectSurveyContainer = (props: IProjectSurveyContainerProps) => {
  const { params, viewParam } = props;
  const history = useHistory();
  const location = useLocation();

  const [showSearch, setShowSearch] = useState(false);

  const views = [
    { value: ProjectSurveyViewEnum.PROJECTS, label: 'PROJECTS', icon: mdiFolder },
    { value: ProjectSurveyViewEnum.SURVEYS, label: 'SURVEYS', icon: mdiListBoxOutline }
  ];

  // useEffect(() => {
  //   const viewParamValue = params.get(viewParam) as ProjectSurveyViewEnum;
  //   if (viewParamValue) {
  //     setActiveView(viewParamValue);
  //   }
  // }, [location.search, params, viewParam]);

  const handleToggleChange = (_: React.MouseEvent<HTMLElement, MouseEvent>, value: ProjectSurveyViewEnum) => {
    if (!value) {
      return;
    }
    params.set(viewParam, value);

    console.log(location.pathname);
    console.log(params.get(viewParam));

    history.push({
      pathname: location.pathname,
      search: params.toString()
    });
  };

  const activeView = params.get('projectView');

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
      {activeView === ProjectSurveyViewEnum.PROJECTS && (
        <ProjectsListContainer showSearch={showSearch} params={params} />
      )}
      {activeView === ProjectSurveyViewEnum.SURVEYS && <SurveysListContainer showSearch={showSearch} />}
    </>
  );
};

export default ProjectSurveyContainer;
