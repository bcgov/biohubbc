import ProjectsLayout from 'features/projects/ProjectsLayout';
import React from 'react';
import { Switch } from 'react-router';
import PrivateRoute from 'utils/PrivateRoute';
import NewBlock from './PrototypeOne/NewBlock';

interface IPrototypeRouterProps {
  classes: any;
}

/**
 * Router for all `/prototype/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const PrototypeRouter: React.FC<IPrototypeRouterProps> = (props) => {
  return (
    <Switch>
      <PrivateRoute exact path="/prototype/1" layout={ProjectsLayout} component={NewBlock} componentProps={props} />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      {/* <AppRoute title="*" path="/prototype/*" component={() => <Redirect to="/page-not-found" />} /> */}
    </Switch>
  );
};

export default PrototypeRouter;
