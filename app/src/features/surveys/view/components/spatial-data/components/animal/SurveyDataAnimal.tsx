import Box from '@mui/material/Box';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
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
import { createGeoJSONFeature } from 'utils/spatial-utils';
import SurveyDataLayer from '../map/SurveyDataMapContainer';
import SurveyDataAnimalTable from './table/SurveyDataAnimalTable';

/**
 * Component for displaying animal capture points on a map and in a table.
 * Retrieves and displays data related to animal captures for a specific survey.
 */
export const SurveyDataAnimal = () => {
  const surveyContext = useSurveyContext();
  const { surveyId, projectId } = surveyContext;

  const biohubApi = useBiohubApi();
  const critterbaseApi = useCritterbaseApi();

  // Data loader for fetching animal capture data
  const animalDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCrittersDetailed(projectId, surveyId));

  useEffect(() => {
    animalDataLoader.load(); // Trigger data loading on component mount
  }, [animalDataLoader]);

  const animals = animalDataLoader.data;

  // Memoized computation of capture points for map display
  const capturePoints: ISurveyMapPoint[] = useMemo(() => {
    const points: ISurveyMapPoint[] = [];

    // Iterate over animals array to extract capture points
    for (const animal of animals ?? []) {
      // Iterate over captures array within each animal
      for (const capture of animal.captures ?? []) {
        if (capture.capture_location?.latitude && capture.capture_location?.longitude) {
          const point: ISurveyMapPoint = {
            feature: createGeoJSONFeature(capture.capture_location.latitude, capture.capture_location.longitude),
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
  }, [animals, critterbaseApi.capture]);

  // Define supplementary layer for map display
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
    <>
      {/* Display map with animal capture points */}
      <SurveyDataLayer
        layerName={supplementaryLayer.layerName}
        layerColors={supplementaryLayer.layerColors}
        popupRecordTitle={supplementaryLayer.popupRecordTitle}
        mapPoints={supplementaryLayer.mapPoints}
        isLoading={animalDataLoader.isLoading}
      />

      {/* Display data table with animal capture details */}
      <Box p={2} position="relative">
        <SurveyDataAnimalTable isLoading={animalDataLoader.isLoading} />
      </Box>
    </>
  );
};