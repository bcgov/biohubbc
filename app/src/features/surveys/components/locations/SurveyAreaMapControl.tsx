import MapContainer from 'components/map/MapContainer';
import { LatLngBoundsExpression } from 'leaflet';
import { useState } from 'react';

export const SurveyAreaMapControl = () => {
  const [updatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  return (
    <>
      <MapContainer
        mapId="survey_area_map"
        staticLayers={[
          {
            layerName: 'Sample Layer',
            features: []
          }
        ]}
        bounds={updatedBounds}
      />
    </>
  );
};
