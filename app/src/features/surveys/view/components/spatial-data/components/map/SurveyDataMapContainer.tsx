import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import { ISurveyMapPoint, ISurveyMapPointMetadata } from 'features/surveys/view/SurveyMap';
import SurveyMapPopup from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useState } from 'react';
import { coloredCustomPointMarker } from 'utils/mapUtils';
import SurveyDataMap from './components/SurveyDataMap';

/**
 * Props interface for SurveyDataLayer component.
 */
interface ISurveyDataLayerProps {
  layerName: string;
  popupRecordTitle: string;
  mapPoints: ISurveyMapPoint[];
  isLoading: boolean;
  layerColors?: {
    fillColor: string;
    color: string;
    opacity?: number;
  };
}

/**
 * Component for displaying survey data on a map with configurable layers and points.
 * Manages loading of metadata for map points and renders map layers and related components.
 */
const SurveyDataLayer = (props: ISurveyDataLayerProps) => {
  const { layerName, layerColors, popupRecordTitle, mapPoints, isLoading } = props;

  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  const handlePopupOpen = async (mapPoint: ISurveyMapPoint) => {
    if (mapPointMetadata[mapPoint.key]) {
      return;
    }
    const metadata = await mapPoint.onLoadMetadata();
    setMapPointMetadata((prev) => ({ ...prev, [mapPoint.key]: metadata }));
  };

  const createFeature = (mapPoint: ISurveyMapPoint): IStaticLayerFeature => {
    const isLoading = !mapPointMetadata[mapPoint.key];

    return {
      key: mapPoint.key,
      geoJSON: mapPoint.feature,
      GeoJSONProps: {
        onEachFeature: (_, layer) => {
          layer.on({
            popupopen: () => handlePopupOpen(mapPoint)
          });
        },
        pointToLayer: (_, latlng) => coloredCustomPointMarker({ latlng, fillColor: layerColors?.fillColor })
      },
      popup: (
        <SurveyMapPopup isLoading={isLoading} title={popupRecordTitle} metadata={mapPointMetadata[mapPoint.key]} />
      ),
      tooltip: <SurveyMapTooltip label={popupRecordTitle} />
    };
  };

  const layer: IStaticLayer = {
    layerName,
    layerColors: {
      fillColor: layerColors?.fillColor ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: layerColors?.color ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: mapPoints.map(createFeature)
  };

  return (
    <Box height={{ sm: 300, md: 500 }} position="relative">
      <SurveyDataMap supplementaryLayers={[layer]} isLoading={isLoading} />
    </Box>
  );
};

export default SurveyDataLayer;
