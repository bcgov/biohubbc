import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import {
  ISurveyMapPoint,
  ISurveyMapPointMetadata,
  ISurveyMapSupplementaryLayer
} from 'features/surveys/view/SurveyMap';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { IGetSurveyObservationsGeometryResponse } from 'interfaces/useObservationApi.interface';
import { useEffect, useMemo } from 'react';
import { getFormattedDate } from 'utils/Utils';
import SurveyDataLayer from '../components/SurveyDataLayer';
import SurveyDataObservationTable from './table/SurveyDataObservationTable';

export const SurveyDataObservation = () => {
  const surveyContext = useSurveyContext();

  const { surveyId, projectId } = surveyContext;

  const biohubApi = useBiohubApi();

  const observationsGeometryDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationsGeometry(projectId, surveyId)
  );

  useEffect(() => {
    observationsGeometryDataLoader.load();
  }, []);

  const observations: IGetSurveyObservationsGeometryResponse | undefined = observationsGeometryDataLoader.data;

  const observationPoints: ISurveyMapPoint[] = useMemo(() => {
    return (
      observations?.surveyObservationsGeometry.map((observation) => {
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
      }) ?? []
    );
  }, [biohubApi.observation, observations, projectId, surveyId]);

  const supplementaryLayer: ISurveyMapSupplementaryLayer = {
    layerName: 'Species Observations',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    popupRecordTitle: 'Species Observations',
    mapPoints: observationPoints
  };

  return (
    <SurveyDataLayer
      layerName={supplementaryLayer.layerName}
      layerColors={supplementaryLayer.layerColors}
      popupRecordTitle={supplementaryLayer.popupRecordTitle}
      mapPoints={supplementaryLayer.mapPoints}
      DataGrid={<SurveyDataObservationTable isLoading={observationsGeometryDataLoader.isLoading} />}
      isLoading={observationsGeometryDataLoader.isLoading}
    />
  );
};
