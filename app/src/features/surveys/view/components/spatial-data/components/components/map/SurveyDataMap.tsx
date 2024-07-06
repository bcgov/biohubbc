import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import SurveyMap from 'features/surveys/view/SurveyMap';
import SurveyMapPopup from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useSurveyContext } from 'hooks/useContext';

interface ISurveyDataMapProps {
  supplementaryLayers: IStaticLayer[];
  isLoading: boolean;
}

const SurveyDataMap = (props: ISurveyDataMapProps) => {
  const { supplementaryLayers } = props;

  const surveyContext = useSurveyContext();

  // STUDY AREA
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

  // SAMPLING SITES
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

  const mapLayers = [samplingSiteMapLayer, studyAreaMapLayer, ...supplementaryLayers];

  return <SurveyMap staticLayers={mapLayers} supplementaryLayers={[]} isLoading={props.isLoading} />;
};

export default SurveyDataMap;
