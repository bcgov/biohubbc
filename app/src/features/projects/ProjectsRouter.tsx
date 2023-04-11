import { ProjectContextProvider } from 'contexts/projectContext';
import { SurveyContextProvider } from 'contexts/surveyContext';
import ProjectPage from 'features/projects/view/ProjectPage';
import CreateSurveyPage from 'features/surveys/CreateSurveyPage';
import EditSurveyPage from 'features/surveys/edit/EditSurveyPage';
import ProjectsLayout from 'layouts/ProjectsLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import { getTitle } from 'utils/Utils';
import CreateProjectPage from './create/CreateProjectPage';
import EditProjectPage from './edit/EditProjectPage';
import ProjectsListPage from './list/ProjectsListPage';
import ProjectParticipantsPage from './participants/ProjectParticipantsPage';
import SurveyRouter from 'features/surveys/SurveyRouter';

/**
 * Router for all `/admin/projects/*` pages.
 *
 * @return {*}
 */
const ProjectsRouter: React.FC = () => {
  return (
    <Switch>
      <AppRoute exact path="/admin/projects" layout={ProjectsLayout}>
        <ProjectsListPage />
      </AppRoute>

      <AppRoute exact path="/admin/projects/create" layout={ProjectsLayout}>
        <CreateProjectPage />
      </AppRoute>

      <AppRoute exact path="/admin/projects/edit" layout={ProjectsLayout}>
        <EditProjectPage />
      </AppRoute>

      <Redirect exact from="/admin/projects/:id" to="/admin/projects/:id/details" />

      <AppRoute path="/admin/projects/:id">
        <ProjectContextProvider>
          <AppRoute exact path="/admin/projects/:id/details" layout={ProjectsLayout}>
            <ProjectPage />
          </AppRoute>

          <AppRoute exact path="/admin/projects/:id/users" layout={ProjectsLayout}>
            <ProjectParticipantsPage />
          </AppRoute>

          <AppRoute exact path="/admin/projects/:id/surveys" layout={ProjectsLayout}>
            <ProjectPage />
          </AppRoute>

          <AppRoute path="/admin/projects/:id/surveys/:survey_id" title={getTitle('Surveys')} layout={ProjectsLayout}>
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
        </ProjectContextProvider>
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/projects/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default ProjectsRouter;
