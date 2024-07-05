import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import SurveyMap, {
    ISurveyMapPoint,
    ISurveyMapPointMetadata,
    ISurveyMapSupplementaryLayer
} from 'features/surveys/view/SurveyMap';
import SurveyMapPopup from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useState } from 'react';

interface ISurveyDataMapDataProps {
  mapLayer: ISurveyMapSupplementaryLayer;
  additionalLayers: IStaticLayer[];
  isLoading?: boolean;
}

const SurveyDataMapData = (props: ISurveyDataMapDataProps) => {
  const { mapLayer, additionalLayers } = props;

  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  const supplementaryLayer: IStaticLayer = {
    layerName: mapLayer.layerName,
    layerColors: {
      fillColor: mapLayer.layerColors?.fillColor ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: mapLayer.layerColors?.color ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: mapLayer.mapPoints.map((mapPoint: ISurveyMapPoint): IStaticLayerFeature => {
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
          }
        },
        popup: (
          <SurveyMapPopup
            isLoading={isLoading}
            title={mapLayer.popupRecordTitle}
            metadata={mapPointMetadata[mapPoint.key]}
          />
        ),
        tooltip: <SurveyMapTooltip label={mapLayer.popupRecordTitle} />
      };
    })
  };

  const staticLayers = [...additionalLayers, supplementaryLayer];

  return <SurveyMap staticLayers={staticLayers} supplementaryLayers={[]} isLoading={props.isLoading ?? false} />;
};

export default SurveyDataMapData;
