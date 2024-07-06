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
  /**
   * Name of the layer to display within the leaflet layer toggle.
   */
  layerName: string;
  /**
   * Title of the popup when clicking on a map point.
   */
  popupRecordTitle: string;
  /**
   * Map points to display on the map.
   */
  mapPoints: ISurveyMapPoint[];
  /**
   * Loading indicator to control map skeleton loader.
   */
  isLoading: boolean;
  /**
   * Colours configuration for the map points.
   */
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
const SurveyDataLayer = (props: ISurveyDataLayerProps): JSX.Element => {
  const { layerName, layerColors, popupRecordTitle, mapPoints, isLoading } = props;

  // State to manage metadata for each map point
  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  // Define the static layer configuration for the map
  const layer: IStaticLayer = {
    layerName,
    layerColors: {
      fillColor: layerColors?.fillColor ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: layerColors?.color ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: mapPoints.map((mapPoint: ISurveyMapPoint): IStaticLayerFeature => {
      // Determine if metadata for this map point is still loading
      const isLoading = !mapPointMetadata[mapPoint.key];

      return {
        key: mapPoint.key,
        geoJSON: mapPoint.feature,
        GeoJSONProps: {
          onEachFeature: (_, layer) => {
            // Event handler for when a popup opens on a map point
            layer.on({
              popupopen: () => {
                if (mapPointMetadata[mapPoint.key]) {
                  return; // Metadata already loaded, skip fetching
                }
                // Fetch metadata asynchronously when popup opens
                mapPoint.onLoadMetadata().then((metadata) => {
                  setMapPointMetadata((prev) => ({ ...prev, [mapPoint.key]: metadata }));
                });
              }
            });
          },
          // Custom marker styling for map points
          pointToLayer: (_, latlng) => coloredCustomPointMarker({ latlng, fillColor: layerColors?.fillColor })
        },
        // Popup component to display metadata when clicking on a map point
        popup: (
          <SurveyMapPopup isLoading={isLoading} title={popupRecordTitle} metadata={mapPointMetadata[mapPoint.key]} />
        ),
        // Tooltip component to display title when hovering over a map point
        tooltip: <SurveyMapTooltip label={popupRecordTitle} />
      };
    })
  };

  return (
    <Box height={{ sm: 300, md: 500 }} position="relative">
      <SurveyDataMap supplementaryLayers={[layer]} isLoading={isLoading} />
    </Box>
  );
};

export default SurveyDataLayer;
