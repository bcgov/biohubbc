import { IStaticLayer } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import { ISurveyMapPoint, ISurveyMapPointMetadata, ISurveyMapSupplementaryLayer } from 'features/surveys/view/SurveyMap';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { IGetSurveyObservationsGeometryObject } from 'interfaces/useObservationApi.interface';
import { useMemo } from 'react';
import { getFormattedDate } from 'utils/Utils';
import SurveyDataMapData from '../components/SurveyDataMapData';

interface ISurveyDataMapObservationsProps {
  observations: IGetSurveyObservationsGeometryObject[];
  mapLayers: IStaticLayer[];
  isLoading?: boolean;
}

const SurveyDataMapObservations = (props: ISurveyDataMapObservationsProps) => {
  const { observations, mapLayers, isLoading } = props;

  const biohubApi = useBiohubApi();
  const { surveyId, projectId } = useSurveyContext();

  const observationPoints: ISurveyMapPoint[] = useMemo(() => {
    return observations.map((observation) => {
      const point: ISurveyMapPoint = {
        feature: {
          type: 'Feature',
          properties: {},
          geometry: observation.geometry
        },
        key: `observation-${observation.survey_observation_id}`,
        onLoadMetadata: async (): Promise<ISurveyMapPointMetadata[]> => {
          const response = await biohubApi.observation.getObservationRecord(
            projectId,
            surveyId,
            observation.survey_observation_id
          );

          return [
            { label: 'Taxon ID', value: String(response.itis_tsn) },
            { label: 'Count', value: String(response.count) },
            {
              label: 'Coords',
              value: [response.latitude, response.longitude]
                .filter((coord): coord is number => coord !== null)
                .map((coord) => coord.toFixed(6))
                .join(', ')
            },
            {
              label: 'Date',
              value: getFormattedDate(
                response.observation_time ? DATE_FORMAT.ShortMediumDateTimeFormat : DATE_FORMAT.ShortMediumDateFormat,
                `${response.observation_date} ${response.observation_time}`
              )
            }
          ];
        }
      };

      return point;
    });
  }, [biohubApi.observation, observations, projectId, surveyId]);

  const mapLayer: ISurveyMapSupplementaryLayer = {
    layerName: 'Species Observation',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    popupRecordTitle: 'Species Observation',
    mapPoints: observationPoints
  };

  return <SurveyDataMapData mapLayer={mapLayer} additionalLayers={mapLayers} isLoading={isLoading} />;
};

export default SurveyDataMapObservations;
