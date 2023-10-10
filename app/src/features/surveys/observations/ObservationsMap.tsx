import { useContext, useMemo } from 'react';
import Box from '@mui/material/Box';
import MapContainer, { INonEditableGeometries } from 'components/map/MapContainer';
// import { LatLngBoundsExpression } from 'leaflet';
// import { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import { ObservationsContext } from 'contexts/observationsContext';
import { Position } from 'geojson';

const ObservationsMap = () => {
  // const [bounds, _setBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  // const [showFullScreenViewMapDialog, setShowFullScreenViewMapDialog] = useState<boolean>(false);
  // const [nonEditableGeometries, setNonEditableGeometries] = useState<any[]>([]);
  /* const [_inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });*/

  const observationsContext = useContext(ObservationsContext);
  const data = observationsContext.observationsDataLoader.data;

  console.log({ data })

  const surveyObservations: INonEditableGeometries[] = useMemo(() => {
    const observations = observationsContext.observationsDataLoader.data?.surveyObservations;

    if (!observations) {
      return [];
    }

    return observations
      .filter((observation) => observation.latitude !== undefined && observation.longitude !== undefined)
      .map((observation) => ({
        feature: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [48.420536, -123.354594]// [observation.latitude, observation.longitude] as Position
          }
        }
      }));
  }, [observationsContext.observationsDataLoader.data])

  console.log('surveyObservations', surveyObservations)

  return (
    <Box position="relative" height={600} sx={{ px: 3, pb: 3 }}>
      <MapContainer
        mapId="survey_observations_map"
        scrollWheelZoom={true}
        // bounds={bounds}
        nonEditableGeometries={surveyObservations}
        setInferredLayersInfo={() => {}}
        
        // markerLayers={markerLayers}
        // staticLayers={staticLayers}
      />
    </Box>
  );
};

export default ObservationsMap;
