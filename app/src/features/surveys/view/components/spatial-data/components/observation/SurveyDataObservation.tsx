import Box from '@mui/material/Box';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import {
  ISurveyMapPoint,
  ISurveyMapPointMetadata,
  ISurveyMapSupplementaryLayer
} from 'features/surveys/view/SurveyMap';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import {
  IGetSurveyObservationsGeometryObject,
  IGetSurveyObservationsGeometryResponse
} from 'interfaces/useObservationApi.interface';
import { useCallback, useEffect, useMemo } from 'react';
import { coloredCustomPointMarker } from 'utils/mapUtils';
import { getFormattedDate } from 'utils/Utils';
import SurveyDataLayer from '../map/SurveyDataMapContainer';
import SurveyDataObservationTable from './table/SurveyDataObservationTable';

/**
 * Component to display survey observation data on a map and in a table.
 *
 */
export const SurveyDataObservation = () => {
  const surveyContext = useSurveyContext();
  const { surveyId, projectId } = surveyContext;
  const biohubApi = useBiohubApi();

  const observationsGeometryDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationsGeometry(projectId, surveyId)
  );

  useEffect(() => {
    observationsGeometryDataLoader.load();
  }, [observationsGeometryDataLoader]);

  const observations: IGetSurveyObservationsGeometryResponse | undefined = observationsGeometryDataLoader.data;

  const formatObservationMetadata = useCallback(
    async (observation: ISurveyMapPoint): Promise<ISurveyMapPointMetadata[]> => {
      const response = await biohubApi.observation.getObservationRecord(projectId, surveyId, Number(observation.key));

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
    },
    [biohubApi.observation, projectId, surveyId]
  );

  const createObservationPoint = useCallback(
    (observation: IGetSurveyObservationsGeometryObject): ISurveyMapPoint => ({
      feature: {
        type: 'Feature',
        properties: {},
        geometry: observation.geometry
      },
      icon: coloredCustomPointMarker,
      key: `Observation-${observation.survey_observation_id}`,
      id: Number(observation.survey_observation_id)
    }),
    [formatObservationMetadata]
  );

  const observationPoints: ISurveyMapPoint[] = useMemo(() => {
    return observations?.surveyObservationsGeometry.map(createObservationPoint) ?? [];
  }, [createObservationPoint, observations?.surveyObservationsGeometry]);

  const supplementaryLayer: ISurveyMapSupplementaryLayer = {
    layerName: 'Species Observations',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    onClick: (mapPoint: ISurveyMapPoint) => formatObservationMetadata(mapPoint),
    popupRecordTitle: 'Species Observation',
    mapPoints: observationPoints
  };

  return (
    <>
      <SurveyDataLayer layers={[supplementaryLayer]} isLoading={observationsGeometryDataLoader.isLoading} />
      <Box p={2} position="relative">
        <SurveyDataObservationTable isLoading={observationsGeometryDataLoader.isLoading} />
      </Box>
    </>
  );
};

export default SurveyDataObservation;
