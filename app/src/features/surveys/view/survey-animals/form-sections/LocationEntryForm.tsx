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
import { MarkerIconColor, MarkerWithResizableRadius } from 'components/map/components/MarkerWithResizableRadius';
import MapContainer from 'components/map/MapContainer';
import { useFormikContext } from 'formik';
import { LatLng } from 'leaflet';
import { ChangeEvent, Fragment, useState } from 'react';
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
  const { handleBlur, setFieldValue } = useFormikContext();
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
    //This gets called everytime the toggle element fires. We need to do a projection each time so that the new fields that get shown
    //will be in sync with the values from the ones that were just hidden.
    if (value.projection_mode === 'wgs') {
      setLatLonFromUTM(primaryLocationFields);
      setLatLonFromUTM(secondaryLocationFields);
    } else {
      setUTMFromLatLng(primaryLocationFields);
      setUTMFromLatLng(secondaryLocationFields);
    }
    setFieldValue(getAnimalFieldName<T>(name, 'projection_mode', index), e.target.checked ? 'utm' : 'wgs');
  };

  const getCurrentMarkerPos = (fields: LocationEntryFields<T>): LatLng => {
    if (value.projection_mode === 'utm') {
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
        {value.projection_mode === 'wgs' ? (
          <Fragment>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Latitude"
                name={getAnimalFieldName<T>(name, fields.latitude, index)}
                handleBlur={handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Longitude"
                name={getAnimalFieldName<T>(name, fields.longitude, index)}
                handleBlur={handleBlur}
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
                handleBlur={handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Easting"
                name={getAnimalFieldName<T>(name, fields.utm_easting, index)}
                handleBlur={handleBlur}
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
            handleBlur={handleBlur}
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
        <FormControlLabel
          control={
            <Checkbox size="small" checked={value.projection_mode === 'utm'} onChange={onProjectionModeSwitch} />
          }
          label="UTM Coordinates"
          sx={{
            display: 'none'
          }}
        />
        <Stack gap={1}>
          {renderLocationFields(primaryLocationFields)}
          {otherPrimaryFields}
        </Stack>
      </Box>

      {secondaryLocationFields && secondaryLocationFields.fieldsetTitle ? (
        <Box component="fieldset">
          <Typography flexGrow={1} component="legend">
            {secondaryLocationFields.fieldsetTitle}
          </Typography>
          <Box>{renderLocationFields(secondaryLocationFields)}</Box>
        </Box>
      ) : null}

      <Box component="fieldset" flex="0 0 auto">
        <Typography component="legend">Location Preview</Typography>
        <ToggleButtonGroup value={markerEnabled} size="small" onChange={handleMarkerSelected} exclusive>
          {primaryLocationFields ? (
            <ToggleButton value="primary">
              {`Set ${primaryLocationFields?.fieldsetTitle}` ?? 'Set Primary Location'}
            </ToggleButton>
          ) : null}
          {secondaryLocationFields ? (
            <ToggleButton value="secondary">
              {`Set ${secondaryLocationFields?.fieldsetTitle}` ?? 'Set Secondary Location'}
            </ToggleButton>
          ) : null}
        </ToggleButtonGroup>

        <Paper
          variant="outlined"
          sx={{
            height: 400
          }}>
          <MapContainer
            mapId={`location-entry-${name}-${index}`}
            scrollWheelZoom={false}
            additionalLayers={[
              renderResizableMarker(primaryLocationFields, markerEnabled === 'primary', 'blue'),
              renderResizableMarker(secondaryLocationFields, markerEnabled === 'secondary', 'green')
            ]}
          />
        </Paper>
      </Box>
    </Stack>
  );
};

export default LocationEntryForm;
