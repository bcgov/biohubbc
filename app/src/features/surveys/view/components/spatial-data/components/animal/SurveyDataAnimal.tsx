import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import {
  ISurveyMapPoint,
  ISurveyMapPointMetadata,
  ISurveyMapSupplementaryLayer
} from 'features/surveys/view/SurveyMap';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo } from 'react';
import { createGeoJSONPoint } from 'utils/Utils';
import SurveyDataLayer from '../components/SurveyDataLayer';
import SurveyDataAnimalTable from './table/SurveyDataAnimalTable';

export const SurveyDataAnimal = () => {
  const surveyContext = useSurveyContext();

  const { surveyId, projectId } = surveyContext;

  const biohubApi = useBiohubApi();
  const critterbaseApi = useCritterbaseApi();

  // TODO: Fix critterbase endpoint. Currently returns an empty array when format = detailed.
  const animalDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCrittersDetailed(projectId, surveyId));

  useEffect(() => {
    animalDataLoader.load();
  }, []);

  const animals = animalDataLoader.data;

  const capturePoints: ISurveyMapPoint[] = useMemo(() => {
    const points: ISurveyMapPoint[] = [];

    // Iterate over animals array
    for (const animal of animals ?? []) {
      // Iterate over captures array within each animal
      for (const capture of animal.captures ?? []) {
        if (capture.capture_location && capture.capture_location.latitude && capture.capture_location.longitude) {
          const point: ISurveyMapPoint = {
            feature: {
              type: 'Feature',
              properties: {},
              geometry: createGeoJSONPoint(capture.capture_location.latitude, capture.capture_location.longitude)
            },
            key: `capture-${capture.capture_id}`,
            onLoadMetadata: async (): Promise<ISurveyMapPointMetadata[]> => {
              const response = await critterbaseApi.capture.getCapture(capture.capture_id);

              return [
                { label: 'Capture ID', value: String(response.capture_id) },
                { label: 'Date', value: String(response.capture_date) },
                {
                  label: 'Coords',
                  value: [response.capture_location?.latitude ?? null, response.capture_location?.longitude ?? null]
                    .filter((coord): coord is number => coord !== null)
                    .map((coord) => coord.toFixed(6))
                    .join(', ')
                },
                {
                  label: 'Time',
                  value: capture.capture_time ?? ''
                }
              ];
            }
          };

          points.push(point);
        }
      }
    }

    return points;
  }, [biohubApi.observation, animals, projectId, surveyId]);

  const supplementaryLayer: ISurveyMapSupplementaryLayer = {
    layerName: 'Animal Captures',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    popupRecordTitle: 'Animal Captures',
    mapPoints: capturePoints
  };

  return (
    <SurveyDataLayer
      layerName={supplementaryLayer.layerName}
      layerColors={supplementaryLayer.layerColors}
      popupRecordTitle={supplementaryLayer.popupRecordTitle}
      mapPoints={supplementaryLayer.mapPoints}
      DataGrid={<SurveyDataAnimalTable isLoading={animalDataLoader.isLoading} />}
      isLoading={animalDataLoader.isLoading}
    />
  );
};
