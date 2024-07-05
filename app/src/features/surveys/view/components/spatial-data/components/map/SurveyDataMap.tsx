import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import SurveyMapPopup from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useSurveyContext } from 'hooks/useContext';
import { ITelemetry } from 'hooks/useTelemetryApi';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { IGetSurveyObservationsGeometryObject } from 'interfaces/useObservationApi.interface';
import { SurveySpatialDatasetViewEnum } from '../SurveySpatialToolbar';
import { SurveyDataMapAnimals } from './animal/SurveyDataMapAnimals';
import SurveyDataMapObservations from './observation/SurveyDataMapObservations';
import { SurveyDataMapTelemetry } from './telemetry/SurveyDataMapTelemetry';

interface ISurveyDataMapProps {
  activeView: SurveySpatialDatasetViewEnum;
  captures: ICaptureResponse[];
  observations: IGetSurveyObservationsGeometryObject[];
  telemetry: ITelemetry[];
}

const SurveyDataMap = (props: ISurveyDataMapProps) => {
  const { activeView, captures, observations, telemetry } = props;

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
    layerName: 'Sampling Site',
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
          tooltip: <SurveyMapTooltip label="Sampling Sites" />
        };
      }) ?? []
  };

  const mapLayers = [samplingSiteMapLayer, studyAreaMapLayer];

  switch (activeView) {
    case SurveySpatialDatasetViewEnum.OBSERVATIONS:
      return <SurveyDataMapObservations observations={observations} mapLayers={mapLayers} />;
    case SurveySpatialDatasetViewEnum.ANIMALS:
      return <SurveyDataMapAnimals captures={captures} mapLayers={mapLayers} />;
    case SurveySpatialDatasetViewEnum.TELEMETRY:
      return <SurveyDataMapTelemetry telemetry={telemetry} mapLayers={mapLayers} />;
    default:
      return null;
  }
};

export default SurveyDataMap;
