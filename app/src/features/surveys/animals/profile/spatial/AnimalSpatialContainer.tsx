import { mdiMapMarker, mdiSkull } from '@mdi/js';
import Box from '@mui/material/Box';
import { MultiSelectToggleButtonGroup } from 'components/toggle/MultiSelectToggleButtonGroup';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SurveySpatialAnimalCapturePopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalCapturePopup';
import { SurveySpatialAnimalMortalityPopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalMortalityPopup';
import SurveyMap from 'features/surveys/view/SurveyMap';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { Feature } from 'geojson';
import { ICaptureResponse, IMortalityResponse } from 'interfaces/useCritterApi.interface';
import { useMemo, useState } from 'react';
import { coloredCustomMortalityMarker } from 'utils/mapUtils';
import { isDefined } from 'utils/Utils';

interface AnimalSpatialContainerProps {
  captures: ICaptureResponse[];
  mortalities: IMortalityResponse[];
  isLoading?: boolean;
}

export enum AnimalSpatialDatasetViewEnum {
  CAPTURES = 'CAPTURES',
  MORTALITIES = 'MORTALITIES'
}

export const AnimalSpatialContainer = ({ captures, mortalities, isLoading }: AnimalSpatialContainerProps) => {
  const [activeViews, setActiveViews] = useState<Set<AnimalSpatialDatasetViewEnum>>(
    new Set([AnimalSpatialDatasetViewEnum.CAPTURES, AnimalSpatialDatasetViewEnum.MORTALITIES])
  );

  // Captures layer
  const captureFeatures = captures
    .filter(
      (capture) =>
        capture.capture_location &&
        isDefined(capture.capture_location.latitude) &&
        isDefined(capture.capture_location.longitude)
    )
    .map((capture) => ({
      id: capture.capture_id,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [capture.capture_location!.longitude, capture.capture_location!.latitude]
      },
      properties: { captureId: capture.capture_id, date: capture.capture_date }
    }));

  // Mortalities layer
  const mortalityFeatures = mortalities
    .filter(
      (mortality) =>
        mortality.location && isDefined(mortality.location.latitude) && isDefined(mortality.location.longitude)
    )
    .map((mortality) => ({
      id: mortality.mortality_id,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [mortality.location!.longitude, mortality.location!.latitude]
      },
      properties: { mortalityId: mortality.mortality_id, date: mortality.mortality_timestamp }
    }));

  const captureLayer = {
    layerName: 'Animal Captures',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: captureFeatures.map((feature) => ({
      id: feature.id,
      key: `capture-${feature.id}`,
      geoJSON: feature as Feature
    })),
    popup: (feature: any) => <SurveySpatialAnimalCapturePopup captureId={String(feature.id)} />, // You can customize this popup
    tooltip: (feature: any) => <SurveyMapTooltip title="Animal Capture" key={`capture-tooltip-${feature.id}`} />
  };

  const mortalityLayer = {
    layerName: 'Animal Mortalities',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      marker: coloredCustomMortalityMarker
    },
    features: mortalityFeatures.map((feature) => ({
      id: feature.id,
      key: `mortality-${feature.id}`,
      geoJSON: feature as Feature
    })),
    popup: (feature: any) => <SurveySpatialAnimalMortalityPopup mortalityId={String(feature.id)} />, // You can customize this popup
    tooltip: (feature: any) => <SurveyMapTooltip title="Animal Mortality" key={`mortality-tooltip-${feature.id}`} />
  };

  const staticLayers = useMemo(() => {
    const layers = [];
    if (activeViews.has(AnimalSpatialDatasetViewEnum.CAPTURES)) {
      layers.push(captureLayer);
    }
    if (activeViews.has(AnimalSpatialDatasetViewEnum.MORTALITIES)) {
      layers.push(mortalityLayer);
    }
    return layers;
  }, [activeViews, captureFeatures, mortalityFeatures]);

  return (
    <>
      <Box p={2}>
        <MultiSelectToggleButtonGroup
          activeViews={activeViews}
          onViewChange={setActiveViews}
          orientation="horizontal"
          views={[
            { value: AnimalSpatialDatasetViewEnum.CAPTURES, label: 'Captures', icon: mdiMapMarker },
            { value: AnimalSpatialDatasetViewEnum.MORTALITIES, label: 'Mortality', icon: mdiSkull }
          ]}
        />
      </Box>
      <Box height={{ sm: 250, md: 400 }} position="relative">
        <SurveyMap isLoading={isLoading} staticLayers={staticLayers} />
      </Box>
    </>
  );
};
