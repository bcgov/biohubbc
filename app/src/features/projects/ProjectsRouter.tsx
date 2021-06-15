import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import ProjectsListPage from 'features/projects/list/ProjectsListPage';
import ProjectsLayout from 'features/projects/ProjectsLayout';
import ProjectPage from 'features/projects/view/ProjectPage';
import SurveyPage from 'features/surveys/view/SurveyPage';
import CreateSurveyPage from 'features/surveys/CreateSurveyPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import BlockObservationPage from 'features/observations/BlockObservationPage';

interface IProjectsRouterProps {
  classes: any;
}

/**
 * Router for all `/project/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectsRouter: React.FC<IProjectsRouterProps> = (props) => {
  return (
    <Switch>
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects"
        component={ProjectsListPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/create"
        component={CreateProjectPage}
        componentProps={props}
      />
      <Redirect exact from="/projects/:id?" to="/projects/:id?/details" />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?/details"
        component={ProjectPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?/surveys"
        component={ProjectPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?/surveys/:survey_id?/details"
        component={SurveyPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?/surveys/:survey_id?/attachments"
        component={SurveyPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?/surveys/:survey_id?/observations"
        component={SurveyPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?/survey/create"
        component={CreateSurveyPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?/surveys/:survey_id?/observations/create"
        component={BlockObservationPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?/attachments"
        component={ProjectPage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/projects/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default ProjectsRouter;
