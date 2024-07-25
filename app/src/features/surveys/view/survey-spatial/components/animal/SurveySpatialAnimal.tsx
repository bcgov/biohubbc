import Box from '@mui/material/Box';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SurveySpatialAnimalCapturePopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalCapturePopup';
import { SurveySpatialAnimalMortalityPopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalMortalityPopup';
import { SurveySpatialAnimalTable } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalTable';
import { SurveySpatialMap } from 'features/surveys/view/survey-spatial/components/map/SurveySpatialMap';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo } from 'react';
import { createGeoJSONFeature } from 'utils/spatial-utils';

/**
 * Component for displaying animal capture points on a map and in a table.
 * Retrieves and displays data related to animal captures for a specific survey.
 */
export const SurveySpatialAnimal = () => {
  const surveyContext = useSurveyContext();

  const crittersApi = useCritterbaseApi();

  const critterIds = useMemo(
    () => surveyContext.critterDataLoader.data?.map((critter) => critter.critter_id) ?? [],
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

  const geometry = useMemo(
    () => geometryDataLoader.data ?? { captures: [], mortalities: [] },
    [geometryDataLoader.data]
  );

  const capturePoints = useMemo(
    () =>
      geometry.captures.map((capture) => ({
        id: capture.capture_id,
        key: `capture-${capture.capture_id}`,
        geoJSON: createGeoJSONFeature(capture.coordinates[0], capture.coordinates[1])
        //   icon: coloredCustomPointMarker
      })),
    [geometry.captures]
  );

  const mortalityPoints = useMemo(
    () =>
      geometry.mortalities.map((mortality) => ({
        id: mortality.mortality_id,
        key: `mortality-${mortality.mortality_id}`,
        geoJSON: createGeoJSONFeature(mortality.coordinates[0], mortality.coordinates[1])
        //   icon: coloredCustomMortalityMarker,
      })),
    [geometry]
  );

  const captureLayer: IStaticLayer = {
    layerName: 'Animal Captures',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: capturePoints,
    popup: (feature) => <SurveySpatialAnimalCapturePopup feature={feature} />
  };

  const mortalityLayer: IStaticLayer = {
    layerName: 'Animal Mortalities',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: mortalityPoints,
    popup: (feature) => <SurveySpatialAnimalMortalityPopup feature={feature} />
  };

  return (
    <>
      {/* Display map with animal capture points */}
      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveySpatialMap staticLayers={[captureLayer, mortalityLayer]} isLoading={geometryDataLoader.isLoading} />
      </Box>

      {/* Display data table with animal capture details */}
      <Box p={2} position="relative">
        <SurveySpatialAnimalTable isLoading={geometryDataLoader.isLoading} />
      </Box>
    </>
  );
};
