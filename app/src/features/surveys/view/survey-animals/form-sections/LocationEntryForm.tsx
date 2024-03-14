import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import AdditionalLayers from 'components/map/components/AdditionalLayers';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { MapBaseCss } from 'components/map/components/MapBaseCss';
import { MarkerIconColor, MarkerWithResizableRadius } from 'components/map/components/MarkerWithResizableRadius';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { useFormikContext } from 'formik';
import { LatLng } from 'leaflet';
import { get } from 'lodash-es';
import React, { useState } from 'react';
import { LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';

type FormLocationsPreviewProps<T> = {
  locations: Array<{
    title: string;
    pingColour: MarkerIconColor;
    fields: {
      latitude: keyof T;
      longitude: keyof T;
    };
  }>;
};

const FormLocationPreview = <T,>(props: FormLocationsPreviewProps<T>) => {
  const { setFieldValue, values } = useFormikContext<T>();

  const [markerToggle, setMarkerToggle] = useState<number | null>(null);

  const handleSetMarkerLocation = (coords: LatLng) => {
    if (markerToggle === null) {
      return;
    }

    setFieldValue(props.locations[markerToggle].fields.latitude as string, coords.lat);
    setFieldValue(props.locations[markerToggle].fields.longitude as string, coords.lng);
    setMarkerToggle(null);
  };

  const renderMarker = (position: LatLng, color: MarkerIconColor): JSX.Element => {
    return (
      <MarkerWithResizableRadius
        radius={0}
        position={position}
        markerColor={color}
        listenForMouseEvents={markerToggle !== null}
        handlePlace={handleSetMarkerLocation}
      />
    );
  };

  return (
    <Stack flexDirection="column" gap={4}>
      <Box component="fieldset" flex="0 0 auto">
        <Typography component="legend">Location Preview</Typography>
        <ToggleButtonGroup value={markerToggle} onChange={(_event, value) => setMarkerToggle(value)} exclusive>
          {props.locations.map((location, idx) => (
            <ToggleButton size="small" color="primary" value={idx}>
              {`Set ${location.title} Location`}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Paper
          variant="outlined"
          sx={{
            position: 'relative',
            height: 350
          }}>
          <Stack
            sx={{
              display: 'none',
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              zIndex: '999',
              transformOrigin: '50% 50%',
              transform: 'translateX(-50%)',
              '& .MuiToggleButton-root': {
                px: 2,
                fontSize: '12px',
                fontWeight: 700,
                '&.Mui-selected': {
                  background: '#003366',
                  color: '#fff'
                }
              }
            }}></Stack>
          <LeafletMapContainer
            id={`location-entry`}
            scrollWheelZoom={true}
            style={{ height: 400 }}
            center={MAP_DEFAULT_CENTER}
            zoom={MAP_DEFAULT_ZOOM}>
            <MapBaseCss />
            <AdditionalLayers
              layers={props.locations.map((location) => {
                const latLng = new LatLng(
                  get(values, location.fields.latitude),
                  get(values, location.fields.longitude)
                );
                return renderMarker(latLng, location.pingColour);
              })}
            />
            <LayersControl>
              <BaseLayerControls />
            </LayersControl>
          </LeafletMapContainer>
        </Paper>
      </Box>
    </Stack>
  );
};

export default FormLocationPreview;
