import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useSurveyContext } from 'hooks/useContext';
import { Popup } from 'react-leaflet';

/**
 * Hook to get the sampling site static layer.
 *
 * @return {*}  {IStaticLayer}
 */
export const useSamplingSiteStaticLayer = (): IStaticLayer => {
  const surveyContext = useSurveyContext();

  const samplingSiteStaticLayer: IStaticLayer = {
    layerName: 'Sampling Sites',
    layerOptions: {
      color: SURVEY_MAP_LAYER_COLOURS.SAMPLING_SITE_COLOUR,
      fillColor: SURVEY_MAP_LAYER_COLOURS.SAMPLING_SITE_COLOUR
    },
    features:
      surveyContext.sampleSiteDataLoader.data?.sampleSites.flatMap((site) => {
        return {
          id: site.survey_sample_site_id,
          key: `sampling-site-${site.survey_sample_site_id}`,
          geoJSON: site.geojson
        };
      }) ?? [],
    popup: (feature) => {
      const sampleSite = surveyContext.sampleSiteDataLoader.data?.sampleSites.find(
        (item) => item.survey_sample_site_id === feature.id
      );

      const metadata = [];

      if (sampleSite) {
        metadata.push({
          label: 'Name',
          value: sampleSite.name
        });

        metadata.push({
          label: 'Description',
          value: sampleSite.description
        });
      }

      return (
        <Popup keepInView={false} closeButton={true} autoPan={true}>
          <SurveyMapPopup
            title="Sampling Site"
            metadata={metadata}
            isLoading={false}
            key={`sampling-site-popup-${feature.id}`}
          />
        </Popup>
      );
    },
    tooltip: (feature) => <SurveyMapTooltip title="Sampling Site" key={`sampling-site-tooltip-${feature.id}`} />
  };

  return samplingSiteStaticLayer;
};
