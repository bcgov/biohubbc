import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useMemo } from 'react';
import { Popup } from 'react-leaflet';

import { useHistory } from 'react-router';

interface ISurveySpatialStudyAreaPopupProps {
  surveyId: number;
  projectId: number;
}

/**
 * Returns information about a survey with an action button for opening the survey
 *
 * @param {ISurveySpatialStudyAreaPopupProps} props
 * @returns {*}
 */
export const SurveySpatialStudyAreaPopup = (props: ISurveySpatialStudyAreaPopupProps) => {
  const { projectId, surveyId } = props;

  const biohubApi = useBiohubApi();
  const history = useHistory();

  const projectDataLoader = useDataLoader(() => biohubApi.project.getProjectForView(projectId));
  const surveyDataLoader = useDataLoader(() => biohubApi.survey.getSurveyForView(projectId, surveyId));

  const popupMetadata = useMemo(() => {
    if (!surveyDataLoader.data || !projectDataLoader.data) {
      return [];
    }

    return [
      { label: 'Project', value: projectDataLoader.data.projectData.project.project_name },
      { label: 'Survey', value: surveyDataLoader.data.surveyData.survey_details.survey_name },
      {
        label: 'Start Date',
        value: dayjs(surveyDataLoader.data.surveyData.survey_details.start_date).format(DATE_FORMAT.LongDateTimeFormat)
      },
      {
        label: 'End Date',
        value: dayjs(surveyDataLoader.data.surveyData.survey_details.end_date).format(DATE_FORMAT.LongDateTimeFormat)
      }
    ];
  }, [surveyDataLoader.data, projectDataLoader.data]);

  return (
    <Popup
      keepInView={false}
      closeButton={true}
      autoPan={true}
      maxWidth={450}
      eventHandlers={{
        add: async () => {
          projectDataLoader.load();
          surveyDataLoader.load();
        }
      }}>
      <SurveyMapPopup
        isLoading={surveyDataLoader.isLoading || projectDataLoader.isLoading}
        title="Survey Details"
        metadata={popupMetadata}
        key={`survey-popup-${surveyId}`}
        actionButtonLabel="Open Survey"
        handleActionButtonClick={() => history.push(`/admin/projects/${projectId}/surveys/${surveyId}/details`)}
      />
    </Popup>
  );
};
