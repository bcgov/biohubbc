import ProjectsLayout from 'features/projects/ProjectsLayout';
import ProjectPage from 'features/projects/view/ProjectPage';
import CreateSurveyPage from 'features/surveys/CreateSurveyPage';
import SurveyPage from 'features/surveys/view/SurveyPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import CreateProjectPage from './create/CreateProjectPage';
import ProjectsListPage from './list/ProjectsListPage';
import ProjectParticipantsPage from './participants/ProjectParticipantsPage';

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

      <AppRoute exact path="/admin/projects/:id/surveys/:survey_id/details" layout={ProjectsLayout}>
        <ProjectsLayout>
          <SurveyPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/surveys/:survey_id/attachments" layout={ProjectsLayout}>
        <ProjectsLayout>
          <SurveyPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/surveys/:survey_id/observations" layout={ProjectsLayout}>
        <ProjectsLayout>
          <SurveyPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/surveys/:survey_id/results" layout={ProjectsLayout}>
        <ProjectsLayout>
          <SurveyPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/survey/create" layout={ProjectsLayout}>
        <CreateSurveyPage />
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
