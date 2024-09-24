import Box from '@mui/material/Box';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SurveySpatialAnimalCapturePopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalCapturePopup';
import { SurveySpatialAnimalMortalityPopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalMortalityPopup';
import { SurveySpatialAnimalTable } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalTable';
import { SurveySpatialMap } from 'features/surveys/view/survey-spatial/components/map/SurveySpatialMap';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo } from 'react';
import { coloredCustomMortalityMarker } from 'utils/mapUtils';

/**
 * Component for displaying animal capture points on a map and in a table.
 * Retrieves and displays data related to animal captures for a specific survey.
 */
export const SurveySpatialAnimal = () => {
  const surveyContext = useSurveyContext();

  const crittersApi = useCritterbaseApi();

  const critterIds = useMemo(
    () => surveyContext.critterDataLoader.data?.map((critter) => critter.critterbase_critter_id) ?? [],
    [surveyContext.critterDataLoader.data]
  );

  // Data loader for fetching animal capture data for the map ONLY. Table data is fetched separately in `SurveySpatialAnimalTable.tsx`
  const geometryDataLoader = useDataLoader((critter_ids: string[]) =>
    crittersApi.critters.getMultipleCrittersGeometryByIds(critter_ids)
  );

  useEffect(() => {
    if (!critterIds.length) {
      return;
    }

    geometryDataLoader.load(critterIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [critterIds]);

  const captureLayer: IStaticLayer = {
    layerName: 'Animal Captures',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features:
      geometryDataLoader.data?.captures.map((capture) => ({
        id: capture.capture_id,
        key: `capture-${capture.capture_id}`,
        geoJSON: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [capture.coordinates[1], capture.coordinates[0]]
          },
          properties: {}
        }
      })) ?? [],
    popup: (feature) => <SurveySpatialAnimalCapturePopup feature={feature} />,
    tooltip: (feature) => <SurveyMapTooltip title="Animal Capture" key={`mortality-tooltip-${feature.id}`} />
  };

  const mortalityLayer: IStaticLayer = {
    layerName: 'Animal Mortalities',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      marker: coloredCustomMortalityMarker
    },
    features:
      geometryDataLoader.data?.mortalities.map((mortality) => ({
        id: mortality.mortality_id,
        key: `mortality-${mortality.mortality_id}`,
        geoJSON: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [mortality.coordinates[1], mortality.coordinates[0]]
          },
          properties: {}
        }
      })) ?? [],
    popup: (feature) => <SurveySpatialAnimalMortalityPopup feature={feature} />,
    tooltip: (feature) => <SurveyMapTooltip title="Animal Mortality" key={`capture-tooltip-${feature.id}`} />
  };

  return (
    <>
      {/* Display map with animal capture points */}
      <Box height={{ xs: 300, md: 500 }} position="relative">
        <SurveySpatialMap staticLayers={[captureLayer, mortalityLayer]} isLoading={geometryDataLoader.isLoading} />
      </Box>

      {/* Display data table with animal capture details */}
      <Box height={{ xs: 300, md: 500 }} p={2} position="relative">
        <SurveySpatialAnimalTable isLoading={geometryDataLoader.isLoading} />
      </Box>
    </>
  );
};
