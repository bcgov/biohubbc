import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';

interface ISurveySampleSiteMapPopupProps {
  surveySampleSiteId: number;
}

export const SurveySampleSiteMapPopup = (props: ISurveySampleSiteMapPopupProps) => {
  const { surveySampleSiteId } = props;
  const { surveyId, projectId } = useSurveyContext();

  const biohubApi = useBiohubApi();

  const surveyDataLoader = useDataLoader(() =>
    biohubApi.samplingSite.getSampleSiteById(projectId, surveyId, surveySampleSiteId)
  );

  useEffect(() => {
    surveyDataLoader.load();
  }, [surveyDataLoader]);

  const sampleSite = surveyDataLoader.data;

  const metadata = sampleSite
    ? [
        { label: 'Name', value: sampleSite.name },
        { label: 'Description', value: sampleSite.description }
      ]
    : [];

  return (
    <SurveyMapPopup
      title="Sampling Site"
      metadata={metadata}
      isLoading={surveyDataLoader.isLoading || !surveyDataLoader.isReady}
      key={`sampling-site-popup-${sampleSite?.survey_sample_site_id}`}
    />
  );
};
