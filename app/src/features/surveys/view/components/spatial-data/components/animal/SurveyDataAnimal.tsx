import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { ISurveyMapPointMetadata } from 'features/surveys/view/SurveyMap';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { Popup } from 'leaflet';
import { useEffect, useMemo } from 'react';
import { coloredCustomMortalityMarker, coloredCustomPointMarker } from 'utils/mapUtils';
import { createGeoJSONFeature } from 'utils/spatial-utils';
import SurveyDataMap from '../map/SurveyDataMap';
import SurveyDataAnimalTable from './table/SurveyDataAnimalTable';

/**
 * Component for displaying animal capture points on a map and in a table.
 * Retrieves and displays data related to animal captures for a specific survey.
 */
export const SurveyDataAnimal = () => {
  const surveyContext = useSurveyContext();

  const critterbaseApi = useCritterbaseApi();
  const critterIds = surveyContext.critterDataLoader.data?.map((critter) => critter.critter_id) ?? [];

  // Data loader for fetching animal capture data for the map ONLY. Table data is fetched separately in `SurveyDataAnimalTable.tsx`
  const geometryDataLoader = useDataLoader((critter_ids: string[]) =>
    critterbaseApi.critters.getMultipleCrittersGeometryByIds(critter_ids)
  );

  useEffect(() => {
    if (critterIds.length) {
      geometryDataLoader.load(critterIds);
    }
  }, [geometryDataLoader]);

  const geometry = geometryDataLoader.data ?? { captures: [], mortalities: [] };

  const onClickMortalityPoint = async (mortalityId: string): Promise<ISurveyMapPointMetadata[]> => {
    const response = await critterbaseApi.mortality.getMortality(mortalityId);

    return [
      { label: 'Mortality ID', value: String(response.mortality_id) },
      { label: 'Date', value: String(response.mortality_timestamp) },
      {
        label: 'Coords',
        value: [response.location?.latitude ?? null, response.location?.longitude ?? null]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      }
    ];
  };

  const onClickCapturePoint = async (captureId: string): Promise<ISurveyMapPointMetadata[]> => {
    const response = await critterbaseApi.mortality.getMortality(captureId);

    return [
      { label: 'Capture ID', value: String(response.mortality_id) },
      { label: 'Date', value: String(response.mortality_timestamp) },
      {
        label: 'Coords',
        value: [response.location?.latitude ?? null, response.location?.longitude ?? null]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      }
    ];
  };

  const capturePoints: IStaticLayerFeature[] = useMemo(() => {
    const points: IStaticLayerFeature[] = geometry.captures.map((capture) => ({
      geoJSON: createGeoJSONFeature(capture.coordinates[0], capture.coordinates[1]),
      key: `capture-${capture.capture_id}`,
      icon: coloredCustomPointMarker,
      id: capture.capture_id
    }));

    return points;
  }, [geometry, critterbaseApi.capture]);

  const mortalityPoints: IStaticLayerFeature[] = useMemo(() => {
    const points: IStaticLayerFeature[] = geometry.mortalities.map((mortality) => ({
      geoJSON: createGeoJSONFeature(mortality.coordinates[0], mortality.coordinates[1]),
      key: `mortality-${mortality.mortality_id}`,
      icon: coloredCustomMortalityMarker,
      id: mortality.mortality_id
    }));

    return points;
  }, [geometry, critterbaseApi.capture]);

  const captureLayer: IStaticLayer = {
    layerName: 'Animal Captures',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: capturePoints,
    popup: <></> ?? null
  };

  const mortalityLayer: IStaticLayer = {
    layerName: 'Animal Mortalities',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: mortalityPoints,
    popup:
      (
        <Popup key='key' closeButton autoPan>
        <div>
          <h3>title</h3>
          {/* Add other popup content here */}
        </div>
      </Popup>
      ) ?? null
  };

  // Define popup?

  return (
    <>
      {/* Display map with animal capture points */}
      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveyDataMap staticLayers={[captureLayer, mortalityLayer]} isLoading={geometryDataLoader.isLoading} />
      </Box>

      {/* Display data table with animal capture details */}
      <Box p={2} position="relative">
        <SurveyDataAnimalTable isLoading={geometryDataLoader.isLoading} />
      </Box>
    </>
  );
};
