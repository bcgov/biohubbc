import { Box, Checkbox, FormControlLabel, FormGroup, Grid, Switch, Tab, Tabs } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { MarkerIconColor, MarkerWithResizableRadius } from 'components/map/components/MarkerWithResizableRadius';
import MapContainer from 'components/map/MapContainer';
import { useFormikContext } from 'formik';
import { LatLng } from 'leaflet';
import { ChangeEvent, useState } from 'react';
import { getLatLngAsUtm, getUtmAsLatLng } from 'utils/mapProjectionHelpers';
import { coerceZero, formatLabel } from 'utils/Utils';
import { getAnimalFieldName, IAnimal } from '../animal';

type ProjectionMode = 'wgs' | 'utm';

export type LocationEntryFields<T> = {
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
  secondaryCheckboxLabel?: string;
};

const LocationEntryForm = <T extends { projection_mode: ProjectionMode }>({
  name,
  index,
  value,
  primaryLocationFields,
  secondaryLocationFields,
  otherPrimaryFields,
  otherSecondaryFields,
  secondaryCheckboxLabel
}: LocationEntryFormProps<T>) => {
  const { handleBlur, setFieldValue } = useFormikContext();
  const [showSecondary, setShowSecondary] = useState(false); //Controls whether fields for the release event are shown or not.
  const [tabState, setTabState] = useState(0); //Controls whether we are on the Forms tab or the Map tab.
  const [placeSecondaryMode, setPlaceSecondary] = useState(false); //Controls whether left clicking on the map will place the capture or release marker.

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

  const renderLocationFields = (fields: LocationEntryFields<T>): JSX.Element => {
    return (
      <>
        {value.projection_mode === 'wgs' ? (
          <>
            <Grid item xs={6}>
              <CustomTextField
                other={{ required: true, size: 'small' }}
                label={formatLabel(fields.latitude as string)}
                name={getAnimalFieldName<T>(name, fields.latitude, index)}
                handleBlur={handleBlur}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                other={{ required: true, size: 'small' }}
                label={formatLabel(fields.longitude as string)}
                name={getAnimalFieldName<T>(name, fields.longitude, index)}
                handleBlur={handleBlur}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={6}>
              <CustomTextField
                other={{ required: true, size: 'small' }}
                label={formatLabel(fields.utm_northing as string)}
                name={getAnimalFieldName<T>(name, fields.utm_northing, index)}
                handleBlur={handleBlur}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                other={{ required: true, size: 'small' }}
                label={formatLabel(fields.utm_easting as string)}
                name={getAnimalFieldName<T>(name, fields.utm_easting, index)}
                handleBlur={handleBlur}
              />
            </Grid>
          </>
        )}

        <Grid item xs={6}>
          <CustomTextField
            other={{ required: true, size: 'small' }}
            label={formatLabel(fields.coordinate_uncertainty as string)}
            name={getAnimalFieldName<T>(name, fields.coordinate_uncertainty, index)}
            handleBlur={handleBlur}
          />
        </Grid>
      </>
    );
  };

  const renderResizableMarker = (
    fields: LocationEntryFields<T>,
    listening: boolean,
    color: MarkerIconColor
  ): JSX.Element => {
    return (
      <MarkerWithResizableRadius
        radius={coerceZero(value[fields.coordinate_uncertainty] ?? NaN)}
        position={getCurrentMarkerPos(fields)}
        markerColor={color}
        listenForMouseEvents={listening}
        handlePlace={(p) => handleMarkerPlacement(p, fields)}
        handleResize={(n) => {
          setFieldValue(getAnimalFieldName<T>(name, fields.coordinate_uncertainty, index), n.toFixed(3));
        }}
      />
    );
  };

  return (
    <>
      <Grid item xs={12}>
        <Tabs
          value={tabState}
          variant="fullWidth"
          onChange={(e, newVal) => {
            setTabState(newVal);
          }}>
          <Tab label="Forms" />
          <Tab label="Map" />
        </Tabs>
      </Grid>

      {tabState === 0 ? (
        <>
          <Grid item xs={12}>
            <FormGroup sx={{ alignItems: 'end' }}>
              <FormControlLabel
                control={
                  <Switch checked={value.projection_mode === 'utm'} onChange={onProjectionModeSwitch} size={'small'} />
                }
                label="UTM Coordinates"
              />
            </FormGroup>
          </Grid>
          {renderLocationFields(primaryLocationFields)}
          {otherPrimaryFields}
          {secondaryLocationFields ? (
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={showSecondary} onChange={() => setShowSecondary((s) => !s)} />}
                label={secondaryCheckboxLabel}
              />
            </Grid>
          ) : null}
          {showSecondary && secondaryLocationFields ? (
            <>
              {renderLocationFields(secondaryLocationFields)}
              {otherSecondaryFields}
            </>
          ) : null}
        </>
      ) : (
        <Grid item xs={12}>
          {secondaryLocationFields ? (
            <FormGroup sx={{ alignItems: 'end' }}>
              <FormControlLabel
                control={
                  <Switch checked={placeSecondaryMode} onChange={(e, b) => setPlaceSecondary(b)} size={'small'} />
                }
                label={'Place Other Coordinate'}
              />
            </FormGroup>
          ) : null}
          <Box position="relative" height={400}>
            <MapContainer
              mapId={`location-entry-${name}-${index}`}
              scrollWheelZoom={true}
              additionalLayers={[
                renderResizableMarker(primaryLocationFields, !placeSecondaryMode, 'blue'),
                secondaryLocationFields ? (
                  renderResizableMarker(secondaryLocationFields, placeSecondaryMode, 'green')
                ) : (
                  <></>
                )
              ]}
            />
          </Box>
        </Grid>
      )}
    </>
  );
};

export default LocationEntryForm;
