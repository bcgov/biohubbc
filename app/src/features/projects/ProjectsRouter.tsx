import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import ProjectsListPage from 'features/projects/list/ProjectsListPage';
import ProjectsLayout from 'features/projects/ProjectsLayout';
import ProjectPage from 'features/projects/view/ProjectPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import ProjectParticipantsPage from './participants/ProjectParticipantsPage';

interface IProjectsRouterProps {
  classes: any;
}

/**
 * Router for all `/admin/project/*` pages.
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
        path="/admin/projects"
        component={ProjectsListPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/admin/projects/create"
        component={CreateProjectPage}
        componentProps={props}
      />
      <Redirect exact from="/admin/projects/:id?" to="/admin/projects/:id?/details" />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/admin/projects/:id?/details"
        component={ProjectPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/admin/projects/:id?/users"
        component={ProjectParticipantsPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/admin/projects/:id?/surveys"
        component={ProjectPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/admin/projects/:id?/attachments"
        component={ProjectPage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/admin/projects/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default ProjectsRouter;
