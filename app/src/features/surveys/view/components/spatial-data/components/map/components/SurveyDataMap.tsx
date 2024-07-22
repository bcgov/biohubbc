import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import SurveyMap from 'features/surveys/view/SurveyMap';
import SurveyMapPopup from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useSurveyContext } from 'hooks/useContext';
import { useMemo } from 'react';

/**
 * Props interface for SurveyDataMap component.
 */
interface ISurveyDataMapProps {
  /**
   * Array of supplementary static layers to be added to the map.
   */
  supplementaryLayers: IStaticLayer[];
  /**
   * Loading indicator to control map skeleton loader.
   */
  isLoading: boolean;
}

/**
 * Component for displaying survey-related data on a map with predefined layers and points.
 * Manages loading of survey data and renders map layers and related components.
 */
const SurveyDataMap = (props: ISurveyDataMapProps): JSX.Element => {
  const { supplementaryLayers, isLoading } = props;

  // Access survey context to retrieve survey data loaders
  const surveyContext = useSurveyContext();

  // Define study area map layer with study locations
  const studyAreaMapLayer: IStaticLayer = {
    layerName: 'Study Areas',
    layerColors: {
      color: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR,
      fillColor: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR
    },
    features:
      surveyContext.surveyDataLoader.data?.surveyData.locations.flatMap((location) => {
        return location.geojson.map((feature, index) => {
          return {
            key: `${location.survey_location_id}-${index}`,
            geoJSON: feature,
            popup: (
              <SurveyMapPopup
                title={'Study Area'}
                metadata={[{ label: 'Name', value: location.name }]}
                isLoading={false}
              />
            ),
            tooltip: <SurveyMapTooltip label="Study Area" />
          };
        });
      }) ?? []
  };

  // Define sampling site map layer with sample sites
  const samplingSiteMapLayer: IStaticLayer = {
    layerName: 'Sampling Sites',
    layerColors: {
      color: SURVEY_MAP_LAYER_COLOURS.SAMPLING_SITE_COLOUR,
      fillColor: SURVEY_MAP_LAYER_COLOURS.SAMPLING_SITE_COLOUR
    },
    features:
      surveyContext.sampleSiteDataLoader.data?.sampleSites.flatMap((site) => {
        return {
          key: site.survey_sample_site_id,
          geoJSON: site.geojson,
          popup: (
            <SurveyMapPopup
              title={'Sampling Site'}
              metadata={[{ label: 'Name', value: site.name }]}
              isLoading={false}
            />
          ),
          tooltip: <SurveyMapTooltip label="Sampling Site" />
        };
      }) ?? []
  };

  // Combine all map layers, including supplementary layers passed as props
  const mapLayers = useMemo(
    () => [samplingSiteMapLayer, studyAreaMapLayer, ...supplementaryLayers],
    [supplementaryLayers, samplingSiteMapLayer, studyAreaMapLayer]
  );

  // Render SurveyMap component with static and supplementary layers
  return <SurveyMap staticLayers={mapLayers} isLoading={isLoading} />;
};

export default SurveyDataMap;
