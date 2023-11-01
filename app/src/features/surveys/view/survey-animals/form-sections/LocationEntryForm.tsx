import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CustomTextField from 'components/fields/CustomTextField';
import { MarkerIconColor, MarkerWithResizableRadius } from 'components/map/components/MarkerWithResizableRadius';
import MapContainer from 'components/map/MapContainer';
import { useFormikContext } from 'formik';
import { LatLng } from 'leaflet';
import { ChangeEvent, Fragment, useState } from 'react';
import { getLatLngAsUtm, getUtmAsLatLng } from 'utils/mapProjectionHelpers';
import { coerceZero } from 'utils/Utils';
import { getAnimalFieldName, IAnimal, ProjectionMode } from '../animal';
import Typography from '@mui/material/Typography';

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
      <Fragment>       
        {value.projection_mode === 'wgs' ? (
          <Grid container item sm={12} spacing={3}>
            <Grid item xs={6}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Latitude"
                name={getAnimalFieldName<T>(name, fields.latitude, index)}
                handleBlur={handleBlur}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Longitude"
                name={getAnimalFieldName<T>(name, fields.longitude, index)}
                handleBlur={handleBlur}
              />
            </Grid>
          </Grid>

        ) : (
          <Grid container item sm={12} spacing={3}>
            <Grid item xs={6}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Northing"
                name={getAnimalFieldName<T>(name, fields.utm_northing, index)}
                handleBlur={handleBlur}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label="Easting"
                name={getAnimalFieldName<T>(name, fields.utm_easting, index)}
                handleBlur={handleBlur}
              />
            </Grid>
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <CustomTextField
            other={{ 
              required: true, 
              type: 'number',
              InputProps: { endAdornment: <Typography component="div" variant="subtitle2" color="textSecondary" sx={{ml: 2}}>METERS</Typography>}
            }}
            label="Coordinate Uncertainty"
            name={getAnimalFieldName<T>(name, fields.coordinate_uncertainty, index)}
            handleBlur={handleBlur}
          />
        </Grid>
      </Fragment>
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
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabState}
          onChange={(e, newVal) => {
            setTabState(newVal);
          }}>
          <Tab label="FORM" />
          <Tab label="MAP" />
        </Tabs>
      </Box>

      {tabState === 0 ? (
        <>

          <Box px={1} py={3}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox checked={value.projection_mode === 'utm'} onChange={onProjectionModeSwitch} />
                }
                label="Use UTM Coordinates"
              />
            </FormGroup>
          </Box>

          <Box mb={3} component="fieldset">
            <Typography component='legend'>Event Details</Typography>
            <Grid container spacing={3}>
              {renderLocationFields(primaryLocationFields)}
              {otherPrimaryFields}
            </Grid>
          </Box>

          {secondaryLocationFields ? (
            <Box component="fieldset">
              <Typography component='legend'>Release Event Details</Typography>
              <Grid container spacing={3}>
                {renderLocationFields(secondaryLocationFields)}
                {otherSecondaryFields}
              </Grid>
            </Box>
          ) : null}

      </>

      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {secondaryLocationFields ? (
              <FormGroup sx={{ alignItems: 'end' }}>
                <FormControlLabel
                  control={
                    <Checkbox checked={placeSecondaryMode} onChange={(e, b) => setPlaceSecondary(b)} />
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
        </Grid>
      )}
    </>
  );
};

export default LocationEntryForm;
