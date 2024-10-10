import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { SurveySampleSiteMapPopup } from 'features/surveys/view/SurveySampleSiteMapPopup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { Popup } from 'react-leaflet';

/**
 * Hook to get the sampling site static layer.
 *
 * @return {*}  {IStaticLayer}
 */
export const useSamplingSiteStaticLayer = (): IStaticLayer => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const geometryDataLoader = useDataLoader(() =>
    biohubApi.samplingSite.getSampleSitesGeometry(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    geometryDataLoader.load();
  }, []);

  const samplingSites = geometryDataLoader.data?.sampleSites ?? [];

  const samplingSiteStaticLayer: IStaticLayer = {
    layerName: 'Sampling Sites',
    layerOptions: {
      color: SURVEY_MAP_LAYER_COLOURS.SAMPLING_SITE_COLOUR,
      fillColor: SURVEY_MAP_LAYER_COLOURS.SAMPLING_SITE_COLOUR
    },
    features:
      samplingSites.flatMap((site) => {
        return {
          id: site.survey_sample_site_id,
          key: `sampling-site-${site.survey_sample_site_id}`,
          geoJSON: site.geojson
        };
      }) ?? [],
    popup: (feature) => {
      return (
        <Popup keepInView={false} closeButton={true} autoPan={true}>
          <SurveySampleSiteMapPopup surveySampleSiteId={Number(feature.id)} />
        </Popup>
      );
    },
    tooltip: (feature) => <SurveyMapTooltip title="Sampling Site" key={`sampling-site-tooltip-${feature.id}`} />
  };

  return samplingSiteStaticLayer;
};
