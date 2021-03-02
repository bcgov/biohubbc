import MapContainer from 'components/map/MapContainer';
import CreateProjectPage from 'features/projects/CreateProjectPage';
import EditProjectPage from 'features/projects/EditProjectPage';
import ProjectsLayout from 'features/projects/ProjectsLayout';
import ProjectsPage from 'features/projects/ProjectsPage';
import { Feature } from 'geojson';
import React, { useState } from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import ProjectPage from './ProjectPage';

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
      <PrivateRoute exact layout={ProjectsLayout} path="/projects" component={ProjectsPage} componentProps={props} />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/create"
        component={CreateProjectPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?"
        component={ProjectPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={ProjectsLayout}
        path="/projects/:id?/edit"
        component={EditProjectPage}
        componentProps={props}
      />
      {/* Temporary map route for demo */}
      <PrivateRoute exact layout={ProjectsLayout} path="/map" component={MapPage} componentProps={props} />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/projects/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default ProjectsRouter;

// Temporary map page component for demo
const MapPage: React.FC = () => {
  const [geometry, setGeometry] = useState<Feature[]>([]);

  return <MapContainer mapId="1" geometryState={{ geometry, setGeometry }} />;
};
