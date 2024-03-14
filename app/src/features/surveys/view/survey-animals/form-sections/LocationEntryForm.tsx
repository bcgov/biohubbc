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
import { getLatLngAsUtm, getUtmAsLatLng, PROJECTION_MODE } from 'utils/mapProjectionHelpers';

interface IFormLocation<T> {
  title: string;
  pingColour: MarkerIconColor;
  fields: {
    latitude: keyof T;
    longitude: keyof T;
  };
}

type FormLocationsPreviewProps<T> = {
  projection?: PROJECTION_MODE;
  locations: IFormLocation<T>[];
};

const FormLocationPreview = <T,>({ projection = PROJECTION_MODE.WGS, locations }: FormLocationsPreviewProps<T>) => {
  const { setFieldValue, values } = useFormikContext<T>();

  const [markerToggle, setMarkerToggle] = useState<number | null>(null);

  const handleSetMarkerLocation = (coords: LatLng) => {
    if (markerToggle === null) {
      return;
    }
    let latitude = coords.lat;
    let longitude = coords.lng;

    if (projection === PROJECTION_MODE.UTM) {
      [latitude, longitude] = getLatLngAsUtm(latitude, longitude);
    }

    setFieldValue(locations[markerToggle].fields.latitude as string, Number(latitude.toFixed(5)));
    setFieldValue(locations[markerToggle].fields.longitude as string, Number(longitude.toFixed(5)));

    setMarkerToggle(null);
  };

  const renderMarker = (location: IFormLocation<T>): JSX.Element => {
    let latitude = get(values, location.fields.latitude);
    let longitude = get(values, location.fields.longitude);

    if (projection === PROJECTION_MODE.UTM) {
      [latitude, longitude] = getUtmAsLatLng(latitude, longitude);
    }

    // Marking positions can be different than the fields if the projection is UTM.
    const renderPosition = new LatLng(latitude, longitude);

    return (
      <MarkerWithResizableRadius
        key={location.title}
        radius={0}
        position={renderPosition}
        markerColor={location.pingColour}
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
          {locations.map((location, idx) => (
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
            <AdditionalLayers layers={locations.map((location) => renderMarker(location))} />
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
