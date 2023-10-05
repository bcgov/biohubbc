import { useState } from 'react';
import Box from '@mui/material/Box';
import MapContainer from 'components/map/MapContainer';
import { LatLngBoundsExpression } from 'leaflet';
import { IInferredLayers } from 'components/boundary/InferredLocationDetails';

const ObservationsMap = () => {
  const [bounds, _setBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  // const [showFullScreenViewMapDialog, setShowFullScreenViewMapDialog] = useState<boolean>(false);
  const [nonEditableGeometries, _setNonEditableGeometries] = useState<any[]>([]);
  const [_inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });

  return (
    <Box position="relative" height={600} sx={{ px: 3, pb: 3 }}>
      <MapContainer
        mapId="survey_observations_map"
        scrollWheelZoom={true}
        bounds={bounds}
        nonEditableGeometries={nonEditableGeometries}
        setInferredLayersInfo={setInferredLayersInfo}
        // markerLayers={markerLayers}
        // staticLayers={staticLayers}
      />
    </Box>
  );
};

export default ObservationsMap;
