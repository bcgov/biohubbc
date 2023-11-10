import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import AdditionalLayers from 'components/map/components/AdditionalLayers';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { MarkerIconColor, MarkerWithResizableRadius } from 'components/map/components/MarkerWithResizableRadius';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { useFormikContext } from 'formik';
import { LatLng } from 'leaflet';
import { ChangeEvent, Fragment, useState } from 'react';
import { LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { getLatLngAsUtm, getUtmAsLatLng } from 'utils/mapProjectionHelpers';
import { coerceZero } from 'utils/Utils';
import { getAnimalFieldName, IAnimal, ProjectionMode } from '../animal';

type Marker = 'primary' | 'secondary' | null;

export type LocationEntryFields<T> = {
  fieldsetTitle?: string;

  latitude: keyof T;
  longitude: keyof T;
  coordinate_uncertainty: keyof T;
  utm_northing: keyof T;
  utm_easting: keyof T;
};

type LocationEntryFormProps<T> = {
  name: keyof IAnimal;
  index: number;
  value: T;
  primaryLocationFields: LocationEntryFields<T>;
  secondaryLocationFields?: LocationEntryFields<T>;
  otherPrimaryFields?: JSX.Element[];
  otherSecondaryFields?: JSX.Element[];
};

const LocationEntryForm = <T extends { projection_mode: ProjectionMode }>({
  name,
  index,
  value,
  primaryLocationFields,
  secondaryLocationFields,
  otherPrimaryFields,
  otherSecondaryFields
}: LocationEntryFormProps<T>) => {
  const { setFieldValue } = useFormikContext();
  const [markerEnabled, setMarkerEnabled] = useState<Marker>(null);

  const handleMarkerPlacement = (e: LatLng, fields: LocationEntryFields<T>) => {
    setFieldValue(getAnimalFieldName<T>(name, fields.latitude, index), e.lat.toFixed(3));
    setFieldValue(getAnimalFieldName<T>(name, fields.longitude, index), e.lng.toFixed(3));
    const utm_coords = getLatLngAsUtm(e.lat, e.lng);
    setFieldValue(getAnimalFieldName<T>(name, fields.utm_northing, index), utm_coords[1]);
    setFieldValue(getAnimalFieldName<T>(name, fields.utm_easting, index), utm_coords[0]);
  };

  const setLatLonFromUTM = (fields: LocationEntryFields<T> | undefined) => {
    if (fields && (value[fields.latitude] || value[fields.longitude])) {
      const utm_coords = getLatLngAsUtm(
        value[fields.latitude] as unknown as number,
        value[fields.longitude] as unknown as number
      );
      setFieldValue(getAnimalFieldName<T>(name, fields.utm_easting, index), utm_coords[0]);
      setFieldValue(getAnimalFieldName<T>(name, fields.utm_northing, index), utm_coords[1]);
    }
  };

  const setUTMFromLatLng = (fields: LocationEntryFields<T> | undefined) => {
    if (fields && (value[fields.utm_northing] || value[fields.utm_easting])) {
      const wgs_coords = getUtmAsLatLng(
        value[fields.utm_northing] as unknown as number,
        value[fields.utm_easting] as unknown as number
      );
      setFieldValue(getAnimalFieldName<T>(name, fields.latitude, index), wgs_coords[1]);
      setFieldValue(getAnimalFieldName<T>(name, fields.longitude, index), wgs_coords[0]);
    }
  };

  const onProjectionModeSwitch = (e: ChangeEvent<HTMLInputElement>) => {
    //This gets called every time the toggle element fires. We need to do a projection each time so that the new fields that get shown
    //will be in sync with the values from the ones that were just hidden.
    if (value?.projection_mode === 'wgs') {
      setLatLonFromUTM(primaryLocationFields);
      setLatLonFromUTM(secondaryLocationFields);
    } else {
      setUTMFromLatLng(primaryLocationFields);
      setUTMFromLatLng(secondaryLocationFields);
    }
    setFieldValue(getAnimalFieldName<T>(name, 'projection_mode', index), e.target.checked ? 'utm' : 'wgs');
  };

  const getCurrentMarkerPos = (fields: LocationEntryFields<T>): LatLng => {
    if (value?.projection_mode === 'utm') {
      const latlng_coords = getUtmAsLatLng(
        coerceZero(value[fields.utm_northing]),
        coerceZero(value[fields.utm_easting])
      );
      return new LatLng(latlng_coords[1], latlng_coords[0]);
    } else {
      return new LatLng(coerceZero(value[fields.latitude]), coerceZero(value[fields.longitude]));
    }
  };

  const handleMarkerSelected = (event: React.MouseEvent<HTMLElement>, enableMarker: Marker) => {
    setMarkerEnabled(enableMarker);
  };

  const renderLocationFields = (fields?: LocationEntryFields<T>): JSX.Element => {
    if (!fields) {
      return <></>;
    }
    return (
      <Grid container spacing={1}>
        {value?.projection_mode === 'wgs' ? (
          <Fragment>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Latitude"
                name={getAnimalFieldName<T>(name, fields.latitude, index)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Longitude"
                name={getAnimalFieldName<T>(name, fields.longitude, index)}
              />
            </Grid>
          </Fragment>
        ) : (
          <Fragment>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Northing"
                name={getAnimalFieldName<T>(name, fields.utm_northing, index)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Easting"
                name={getAnimalFieldName<T>(name, fields.utm_easting, index)}
              />
            </Grid>
          </Fragment>
        )}

        <Grid item xs={12} sm={4}>
          <CustomTextField
            other={{
              required: true,
              type: 'number'
            }}
            label="Uncertainty (Meters)"
            name={getAnimalFieldName<T>(name, fields.coordinate_uncertainty, index)}
          />
        </Grid>
      </Grid>
    );
  };

  const renderResizableMarker = (
    fields: LocationEntryFields<T> | undefined,
    listening: boolean,
    color: MarkerIconColor
  ): JSX.Element => {
    if (!fields) {
      return <></>;
    }
    return (
      <MarkerWithResizableRadius
        radius={coerceZero(value[fields.coordinate_uncertainty] ?? NaN)}
        position={getCurrentMarkerPos(fields)}
        markerColor={color}
        listenForMouseEvents={listening}
        handlePlace={(p) => {
          handleMarkerPlacement(p, fields);
          setMarkerEnabled(null);
        }}
        handleResize={(n) => {
          setFieldValue(getAnimalFieldName<T>(name, fields.coordinate_uncertainty, index), n.toFixed(3));
        }}
      />
    );
  };

  return (
    <Stack flexDirection="column" gap={4} maxWidth={800}>
      <Box component="fieldset">
        {primaryLocationFields.fieldsetTitle ? (
          <Typography component="legend">{primaryLocationFields.fieldsetTitle}</Typography>
        ) : null}

        <Stack gap={1} alignItems="flex-start">
          {renderLocationFields(primaryLocationFields)}
          <FormControlLabel
            sx={{ ml: 0 }}
            control={
              <Checkbox size="small" checked={value.projection_mode === 'utm'} onChange={onProjectionModeSwitch} />
            }
            label="Use UTM Coordinates"
          />
        </Stack>
      </Box>

      {otherSecondaryFields ? (
        <Box>
          {otherSecondaryFields}
          {renderLocationFields(secondaryLocationFields)}
        </Box>
      ) : null}

      <Box component="fieldset" flex="0 0 auto">
        <Typography component="legend">Location Preview</Typography>
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
            }}>
            <ToggleButtonGroup value={markerEnabled} onChange={handleMarkerSelected} exclusive>
              {primaryLocationFields ? (
                <ToggleButton
                  size="small"
                  value="primary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                  {`Set ${primaryLocationFields?.fieldsetTitle ?? 'Primary Location'}`}
                </ToggleButton>
              ) : null}
              {secondaryLocationFields ? (
                <ToggleButton
                  size="small"
                  value="secondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                  {`Set ${secondaryLocationFields?.fieldsetTitle ?? 'Secondary Location'}`}
                </ToggleButton>
              ) : null}
            </ToggleButtonGroup>
          </Stack>
          <LeafletMapContainer
            id={`location-entry-${name}-${index}`}
            scrollWheelZoom={true}
            style={{ height: 400 }}
            center={MAP_DEFAULT_CENTER}
            zoom={MAP_DEFAULT_ZOOM}>
            <MapBaseCss />
            <AdditionalLayers
              layers={[
                renderResizableMarker(primaryLocationFields, markerEnabled === 'primary', 'blue'),
                secondaryLocationFields ? (
                  renderResizableMarker(secondaryLocationFields, markerEnabled === 'secondary', 'green')
                ) : (
                  <></>
                )
              ]}
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

export default LocationEntryForm;
