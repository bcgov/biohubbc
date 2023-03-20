import ProjectsLayout from 'layouts/ProjectsLayout';
import SurveyPage from 'features/surveys/view/SurveyPage';
import React from 'react';
import { Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';

/**
 * Router for all `/admin/projects/:id/surveys/:survey_id/*` pages.
 *
 * @return {*}
 */
const SurveyRouter: React.FC = () => {
  return (
    <Switch>
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
    </Switch>
  );
};

export default SurveyRouter;
