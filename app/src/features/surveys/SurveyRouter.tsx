import SurveyPage from 'features/surveys/view/SurveyPage';
import ProjectsLayout from 'layouts/ProjectsLayout';
import React from 'react';
import { Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import EditSurveyPage from './edit/EditSurveyPage';

/**
 * Router for all `/admin/projects/:id/surveys/:survey_id/*` pages.
 *
 * @return {*}
 */
const SurveyRouter: React.FC = () => {
  return (
    <Switch>
      <AppRoute exact path="/admin/projects/:id/surveys/:survey_id/details" layout={ProjectsLayout}>
        <SurveyPage />
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/surveys/:survey_id/edit" layout={ProjectsLayout}>
        <EditSurveyPage />
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/surveys/:survey_id/attachments" layout={ProjectsLayout}>
        <SurveyPage />
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/surveys/:survey_id/observations" layout={ProjectsLayout}>
        <SurveyPage />
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/surveys/:survey_id/results" layout={ProjectsLayout}>
        <SurveyPage />
      </AppRoute>
    </Switch>
  );
};

export default SurveyRouter;
