import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import {
  ISurveyMapPoint,
  ISurveyMapPointMetadata,
  ISurveyMapSupplementaryLayer
} from 'features/surveys/view/SurveyMap';
import SurveyMapPopup from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useState } from 'react';
import { coloredCustomPointMarker } from 'utils/mapUtils';
import SurveyDataMap from './components/SurveyDataMap';

/**
 * Props interface for SurveyDataLayer component.
 */
interface ISurveyDataLayerProps {
  layers: ISurveyMapSupplementaryLayer[];
  isLoading: boolean;
}

/**
 * Component for displaying survey data on a map with configurable layers and points.
 * Manages loading of metadata for map points and renders map layers and related components.
 */
const SurveyDataLayer = (props: ISurveyDataLayerProps) => {
  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});
  // const critterbaseApi = useCritterbaseApi();

  // const onLoadMetadata = async (): Promise<ISurveyMapPointMetadata[]> => {
  //   const response = await critterbaseApi.mortality.getMortality('8fb82d9e-b46f-43b1-8d59-47e604162941');

  //   return [
  //     { label: 'Mortality ID', value: String(response.mortality_id) },
  //     { label: 'Date', value: String(response.mortality_timestamp) },
  //     {
  //       label: 'Coords',
  //       value: [response.location?.latitude ?? null, response.location?.longitude ?? null]
  //         .filter((coord): coord is number => coord !== null)
  //         .map((coord) => coord.toFixed(6))
  //         .join(', ')
  //     }
  //   ];
  // }

  const handlePopupOpen = async (mapPoint: ISurveyMapPoint) => {
    if (mapPointMetadata[mapPoint.key]) {
      return;
    }
    // const metadata = await onLoadMetadata();
    setMapPointMetadata((prev) => ({ ...prev, [mapPoint.key]: [{ label: 'Mortality ID', value: String(2) }] }));
  };

  const createFeature = (
    mapPoint: ISurveyMapPoint,
    fillColor: string,
    popupRecordTitle: string
  ): IStaticLayerFeature => {
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
        pointToLayer: (_, latlng) =>
          mapPoint.icon ? mapPoint.icon({ latlng, fillColor }) : coloredCustomPointMarker({ latlng, fillColor })
      },
      popup: (
        <SurveyMapPopup isLoading={isLoading} title={popupRecordTitle} metadata={mapPointMetadata[mapPoint.key]} />
      ),
      tooltip: <SurveyMapTooltip label={popupRecordTitle} />
    };
  };

  const layers: IStaticLayer[] = props.layers.map((layer) => {
    const { layerName, layerColors, mapPoints, popupRecordTitle } = layer;
    const DEFAULT_COLOUR = SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR;

    const fillColor = layerColors?.fillColor ?? DEFAULT_COLOUR;
    const color = layerColors?.color ?? DEFAULT_COLOUR;

    const features = mapPoints.map((point) => createFeature(point, fillColor, popupRecordTitle));

    return {
      layerName,
      layerColors: {
        fillColor,
        color
      },
      features
    };
  });

  return (
    <Box height={{ sm: 300, md: 500 }} position="relative">
      <SurveyDataMap supplementaryLayers={layers} isLoading={props.isLoading} />
    </Box>
  );
};

export default SurveyDataLayer;
