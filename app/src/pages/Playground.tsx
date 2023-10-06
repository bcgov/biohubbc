import { Button, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import ComponentDialog from 'components/dialog/ComponentDialog';
import MapContainer from 'components/map/MapContainer';
import { ITelemetryPointCollection } from 'features/surveys/view/survey-animals/device';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import L, { LatLng } from 'leaflet';
import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { v4 } from 'uuid';

export const Playground = () => {
  const [openMap, setOpenMap] = useState(false);
  const bhApi = useBiohubApi();
  const { load, data } = useDataLoader(() => bhApi.survey.getCritterTelemetry(1, 1, 1, '1970-01-01', '2023-10-10'));
  load();
  useEffect(() => {
    console.log(data);
  }, [data]);

  const transformBctwPointsToGeometry = (featureCollections: ITelemetryPointCollection | undefined): Feature[] => {
    if (!featureCollections) {
      return [];
    }
    const result: Feature[] = [];
    for (const collection of Object.values(featureCollections)) {
      for (const feature of collection.features) {
        if (!feature.properties) {
          feature.properties = {};
        }
        feature.properties.colour = 'purple';
        result.push(feature);
      }
    }
    return result;
  };

  const point = (feature: Feature, latlng: LatLng) => {
    return new L.CircleMarker(latlng, { radius: 5, fillOpacity: 1 });
  };

  return (
    <>
      <ComponentDialog
        dialogProps={{ fullScreen: true, maxWidth: false }}
        dialogTitle={'View Telemetry'}
        open={openMap}
        onClose={() => setOpenMap(false)}>
        <Typography>amogus</Typography>
        <MapContainer
          mapId={`view-animal-telemetry-map`}
          scrollWheelZoom={true}
          additionalLayers={transformBctwPointsToGeometry(data).map((a) => (
            <GeoJSON pointToLayer={point} style={{ color: a.properties?.colour }} key={v4()} data={a}></GeoJSON>
          ))}
        />
      </ComponentDialog>
      <Button onClick={() => setOpenMap(true)}>Open</Button>
    </>
  );
};
