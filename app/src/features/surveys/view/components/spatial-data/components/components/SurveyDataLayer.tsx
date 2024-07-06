import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import { ISurveyMapPoint, ISurveyMapPointMetadata } from 'features/surveys/view/SurveyMap';
import SurveyMapPopup from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useState } from 'react';
import { coloredCustomPointMarker } from 'utils/mapUtils';
import SurveyDataMap from './map/SurveyDataMap';

interface ISurveyDataLayerProps {
  /**
   * Name of the layer to display within the leaflet layer toggle
   */
  layerName: string;
  /**
   * Title of the popup when clicking on a map point
   */
  popupRecordTitle: string;
  /**
   * Map points to display
   */
  mapPoints: ISurveyMapPoint[];
  /**
   * Data grid component to display below the map
   */
  DataGrid: JSX.Element;
  /**
   * Loading indicator to control map skeleton loader
   */
  isLoading: boolean;
  /**
   * Colours of the mapPoints
   */
  layerColors?: {
    fillColor: string;
    color: string;
    opacity?: number | undefined;
  };
}

const SurveyDataLayer = (props: ISurveyDataLayerProps) => {
  const { layerName, layerColors, popupRecordTitle, mapPoints, DataGrid, isLoading } = props;

  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  const layer: IStaticLayer = {
    layerName,
    layerColors: {
      fillColor: layerColors?.fillColor ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: layerColors?.color ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: mapPoints.map((mapPoint: ISurveyMapPoint): IStaticLayerFeature => {
      const isLoading = !mapPointMetadata[mapPoint.key];

      return {
        key: mapPoint.key,
        geoJSON: mapPoint.feature,
        GeoJSONProps: {
          onEachFeature: (_, layer) => {
            layer.on({
              popupopen: () => {
                if (mapPointMetadata[mapPoint.key]) {
                  return;
                }
                mapPoint.onLoadMetadata().then((metadata) => {
                  setMapPointMetadata((prev) => ({ ...prev, [mapPoint.key]: metadata }));
                });
              }
            });
          },
          pointToLayer: (_, latlng) => coloredCustomPointMarker({ latlng, fillColor: layerColors?.fillColor })
        },
        popup: (
          <SurveyMapPopup isLoading={isLoading} title={popupRecordTitle} metadata={mapPointMetadata[mapPoint.key]} />
        ),
        tooltip: <SurveyMapTooltip label={popupRecordTitle} />
      };
    })
  };

  return (
    <>
      {/* MAP */}
      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveyDataMap supplementaryLayers={[layer]} isLoading={isLoading} />
      </Box>

      {/* DATA TABLE */}
      <Box p={2} position="relative">
        {DataGrid}
      </Box>
    </>
  );
};

export default SurveyDataLayer;
