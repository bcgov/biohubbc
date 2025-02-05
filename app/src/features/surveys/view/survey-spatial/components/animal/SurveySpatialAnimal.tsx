import Box from '@mui/material/Box';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SurveySpatialAnimalCapturePopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalCapturePopup';
import { SurveySpatialAnimalMortalityPopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalMortalityPopup';
import SurveyMap from 'features/surveys/view/SurveyMap';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo } from 'react';
import { coloredCustomMortalityMarker } from 'utils/mapUtils';

interface ISurveySpatialAnimalMapProps {
  staticLayers?: IStaticLayer[];
}

/**
 * Reusable component for displaying a survey spatial animal map.
 * This component can be imported and used in multiple places.
 */
export const SurveySpatialAnimal = ({ staticLayers = [] }: ISurveySpatialAnimalMapProps) => {
  const surveyContext = useSurveyContext();
  const crittersApi = useCritterbaseApi();

  const critterIds = useMemo(
    () => surveyContext.critterDataLoader.data?.map((critter) => critter.critterbase_critter_id) ?? [],
    [surveyContext.critterDataLoader.data]
  );

  const geometryDataLoader = useDataLoader((critter_ids: string[]) =>
    crittersApi.critters.getMultipleCrittersGeometryByIds(critter_ids)
  );

  useEffect(() => {
    if (critterIds.length) {
      geometryDataLoader.load(critterIds);
    }
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
    tooltip: (feature) => <SurveyMapTooltip title="Animal Capture" key={`capture-tooltip-${feature.id}`} />
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
    tooltip: (feature) => <SurveyMapTooltip title="Animal Mortality" key={`mortality-tooltip-${feature.id}`} />
  };

  return (
    <Box height={{ xs: 300, md: 500 }} position="relative">
      <SurveyMap
        staticLayers={[...staticLayers, captureLayer, mortalityLayer]}
        isLoading={geometryDataLoader.isLoading}
      />
    </Box>
  );
};
