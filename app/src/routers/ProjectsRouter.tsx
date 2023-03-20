import { SurveyContextProvider } from 'contexts/surveyContext';
import ProjectPage from 'features/projects/view/ProjectPage';
import CreateSurveyPage from 'features/surveys/CreateSurveyPage';
import EditSurveyPage from 'features/surveys/edit/EditSurveyPage';
import ProjectsLayout from 'layouts/ProjectsLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import CreateProjectPage from '../features/projects/create/CreateProjectPage';
import EditProjectPage from '../features/projects/edit/EditProjectPage';
import ProjectsListPage from '../features/projects/list/ProjectsListPage';
import ProjectParticipantsPage from '../features/projects/participants/ProjectParticipantsPage';
import SurveyRouter from './SurveyRouter';

/**
 * Router for all `/admin/projects/*` pages.
 *
 * @return {*}
 */
const ProjectsRouter: React.FC = () => {
  return (
    <Switch>
      <AppRoute exact path="/admin/projects" layout={ProjectsLayout}>
        <ProjectsLayout>
          <ProjectsListPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/create" layout={ProjectsLayout}>
        <ProjectsLayout>
          <CreateProjectPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/edit" layout={ProjectsLayout}>
        <ProjectsLayout>
          <EditProjectPage />
        </ProjectsLayout>
      </AppRoute>

      <Redirect exact from="/admin/projects/:id" to="/admin/projects/:id/details" />

      <AppRoute exact path="/admin/projects/:id/details" layout={ProjectsLayout}>
        <ProjectsLayout>
          <ProjectPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/users" layout={ProjectsLayout}>
        <ProjectsLayout>
          <ProjectParticipantsPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/surveys" layout={ProjectsLayout}>
        <ProjectsLayout>
          <ProjectPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute path="/admin/projects/:id/surveys/:survey_id" layout={ProjectsLayout}>
        <SurveyContextProvider>
          <SurveyRouter />
        </SurveyContextProvider>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/survey/create" layout={ProjectsLayout}>
        <CreateSurveyPage />
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/survey/edit" layout={ProjectsLayout}>
        <EditSurveyPage />
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/attachments" layout={ProjectsLayout}>
        <ProjectPage />
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/projects/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default ProjectsRouter;
