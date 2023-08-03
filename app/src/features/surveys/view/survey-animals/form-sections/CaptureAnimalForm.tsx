import { Box, Checkbox, FormControlLabel, FormGroup, Grid, Switch, Tab, Tabs } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { MarkerWithResizableRadius } from 'components/map/components/MarkerWithResizableRadius';
import MapContainer from 'components/map/MapContainer';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, FormikErrors, useFormikContext } from 'formik';
import { LatLng } from 'leaflet';
import proj4 from 'proj4';
import { ChangeEvent, useState } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalCapture } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';
/**
 * Renders the Capture section for the Individual Animal form
 *
 * Note A: Using <FieldArray/> the name properties must stay in sync with
 * values object and nested arrays.
 * ie: values = { capture: [{id: 'test'}] };  name = 'capture.[0].id';
 *
 * Note B: FormSectionWrapper uses a Grid container to render children elements.
 * Children of FormSectionWrapper can use Grid items to organize inputs.
 *
 * Returns {*}
 */

//type CaptureTabState = 'form' | 'map';
type ProjectionMode = 'wgs' | 'utm';
const CaptureAnimalForm = () => {
  const { values, setFieldValue } = useFormikContext<IAnimal>();

  const name: keyof IAnimal = 'capture';
  const newCapture: IAnimalCapture = {
    capture_latitude: '' as unknown as number,
    capture_longitude: '' as unknown as number,
    capture_utm_northing: '' as unknown as number,
    capture_utm_easting: '' as unknown as number,
    capture_comment: '',
    capture_coordinate_uncertainty: 10,
    capture_timestamp: '' as unknown as Date,
    release_latitude: '' as unknown as number,
    release_longitude: '' as unknown as number,
    release_utm_northing: '' as unknown as number,
    release_utm_easting: '' as unknown as number,
    release_comment: '',
    release_timestamp: '' as unknown as Date,
    release_coordinate_uncertainty: 10,
    projection_mode: 'wgs' as ProjectionMode
  };

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalCaptureTitle}
            titleHelp={SurveyAnimalsI18N.animalCaptureHelp}
            btnLabel={SurveyAnimalsI18N.animalCaptureAddBtn}
            handleAddSection={() => push(newCapture)}
            handleRemoveSection={remove}>
            {values.capture.map((_cap, index) => (
              <CaptureAnimalFormContent
                key={`${name}-${index}-inputs`}
                name={name}
                index={index}
                setFieldValue={setFieldValue}
                value={_cap}
              />
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

interface CaptureAnimalFormContentProps {
  name: keyof IAnimal;
  index: number;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<any>>;
  value: IAnimalCapture;
}

const coerceZero = (n: number | undefined): number => (isNaN(n ?? NaN) ? 0 : Number(n));

const CaptureAnimalFormContent = ({ name, index, setFieldValue, value }: CaptureAnimalFormContentProps) => {
  const [showRelease, setShowRelease] = useState(false);
  const [tabState, setTabState] = useState(0);
  const [placeReleaseMode, setPlaceReleaseMode] = useState(false);

  const utmProjection = `+proj=utm +zone=${10} +north +datum=WGS84 +units=m +no_defs`;
  const wgs84Projection = `+proj=longlat +datum=WGS84 +no_defs`;

  const getUtmAsLatLng = (northing: number, easting: number) => {
    return proj4(utmProjection, wgs84Projection, [Number(easting), Number(northing)]).map((a) => Number(a.toFixed(3)));
  };

  const getLatLngAsUtm = (lat: number, lng: number) => {
    return proj4(wgs84Projection, utmProjection, [Number(lng), Number(lat)]).map((a) => Number(a.toFixed(3)));
  };

  const handleMarkerPlacement = (e: LatLng, isRelease: boolean) => {
    console.log(`handleMarkerPlace ${JSON.stringify(e)}, ${isRelease}`);
    setFieldValue(
      getAnimalFieldName<IAnimalCapture>(name, isRelease ? 'release_latitude' : 'capture_latitude', index),
      e.lat.toFixed(3)
    );
    setFieldValue(
      getAnimalFieldName<IAnimalCapture>(name, isRelease ? 'release_longitude' : 'capture_longitude', index),
      e.lng.toFixed(3)
    );
    const utm_coords = getLatLngAsUtm(e.lat, e.lng);
    setFieldValue(
      getAnimalFieldName<IAnimalCapture>(name, isRelease ? 'release_utm_northing' : 'capture_utm_northing', index),
      utm_coords[1]
    );
    setFieldValue(
      getAnimalFieldName<IAnimalCapture>(name, isRelease ? 'release_utm_easting' : 'capture_utm_easting', index),
      utm_coords[0]
    );
  };

  const onProjectionModeSwitch = (e: ChangeEvent<HTMLInputElement>, isRelease: boolean) => {
    if (value.projection_mode === 'wgs') {
      const utm_coords = getLatLngAsUtm(value.capture_latitude, value.capture_longitude);
      setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'capture_utm_northing', index), utm_coords[1]);
      setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'capture_utm_easting', index), utm_coords[0]);
      if (value.release_latitude || value.release_longitude) {
        const utm_coords_release = getLatLngAsUtm(
          coerceZero(value.release_latitude),
          coerceZero(value.release_longitude)
        );
        setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'release_utm_northing', index), utm_coords_release[1]);
        setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'release_utm_easting', index), utm_coords_release[0]);
      }
    } else {
      const wgs_coords = getUtmAsLatLng(coerceZero(value.capture_utm_northing), coerceZero(value.capture_utm_easting));
      setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'capture_latitude', index), wgs_coords[1]);
      setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'capture_longitude', index), wgs_coords[0]);
      if (value.release_utm_northing || value.release_utm_easting) {
        const wgs_coords_release = getUtmAsLatLng(
          coerceZero(value.release_utm_northing),
          coerceZero(value.release_utm_easting)
        );
        setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'release_latitude', index), wgs_coords_release[1]);
        setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'release_longitude', index), wgs_coords_release[0]);
      }
    }
    setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'projection_mode', index), e.target.checked ? 'utm' : 'wgs');
  };

  const getCurrentMarkerPos = (isRelease: boolean): LatLng => {
    if (value.projection_mode === 'utm') {
      const latlng_coords = getUtmAsLatLng(
        coerceZero(isRelease ? value.release_utm_northing : value.capture_utm_northing),
        coerceZero(isRelease ? value.release_utm_easting : value.capture_utm_easting)
      );
      return new LatLng(latlng_coords[1], latlng_coords[0]);
    } else {
      return new LatLng(
        coerceZero(isRelease ? value.release_latitude : value.capture_latitude),
        coerceZero(isRelease ? value.release_longitude : value.capture_longitude)
      );
    }
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
          <Tab label="Text" />
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
          {value.projection_mode === 'wgs' ? (
            <>
              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Capture Latitude"
                  name={getAnimalFieldName<IAnimalCapture>(name, 'capture_latitude', index)}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Capture Longitude"
                  name={getAnimalFieldName<IAnimalCapture>(name, 'capture_longitude', index)}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Capture UTM Northing"
                  name={getAnimalFieldName<IAnimalCapture>(name, 'capture_utm_northing', index)}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Capture UTM Easting"
                  name={getAnimalFieldName<IAnimalCapture>(name, 'capture_utm_easting', index)}
                />
              </Grid>
            </>
          )}

          <Grid item xs={6}>
            <CustomTextField
              other={{ required: true, size: 'small' }}
              label="Capture Coordinate Uncertainty"
              name={getAnimalFieldName<IAnimalCapture>(name, 'capture_coordinate_uncertainty', index)}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              other={{ required: true, size: 'small' }}
              label="Temp Capture Timestamp"
              name={getAnimalFieldName<IAnimalCapture>(name, 'capture_timestamp', index)}
            />
          </Grid>
          <Grid item />
          <Grid item xs={6}>
            <TextInputToggle label="Add comment about this Capture">
              <CustomTextField
                other={{ required: true, size: 'small' }}
                label="Capture Comment"
                name={getAnimalFieldName<IAnimalCapture>(name, 'capture_comment', index)}
              />
            </TextInputToggle>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={showRelease} onChange={() => setShowRelease((s) => !s)} />}
              label={SurveyAnimalsI18N.animalCaptureReleaseRadio}
            />
          </Grid>
          {showRelease ? (
            <>
              {value.projection_mode === 'wgs' ? (
                <>
                  <Grid item xs={6}>
                    <CustomTextField
                      other={{ required: true, size: 'small' }}
                      label="Release Latitude"
                      name={getAnimalFieldName<IAnimalCapture>(name, 'release_latitude', index)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextField
                      other={{ required: true, size: 'small' }}
                      label="Release Longitude"
                      name={getAnimalFieldName<IAnimalCapture>(name, 'release_longitude', index)}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={6}>
                    <CustomTextField
                      other={{ required: true, size: 'small' }}
                      label="Release UTM Northing"
                      name={getAnimalFieldName<IAnimalCapture>(name, 'release_utm_northing', index)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextField
                      other={{ required: true, size: 'small' }}
                      label="Release UTM Easting"
                      name={getAnimalFieldName<IAnimalCapture>(name, 'release_utm_easting', index)}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Release Coordinate Uncertainty"
                  name={getAnimalFieldName<IAnimalCapture>(name, 'release_coordinate_uncertainty', index)}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Temp Release Timestamp"
                  name={getAnimalFieldName<IAnimalCapture>(name, 'release_timestamp', index)}
                />
              </Grid>
              <Grid item />
              <Grid item xs={6}>
                <TextInputToggle label="Add comment about this Release">
                  <CustomTextField
                    other={{ required: true, size: 'small' }}
                    label="Release Comment"
                    name={getAnimalFieldName<IAnimalCapture>(name, 'release_comment', index)}
                  />
                </TextInputToggle>
              </Grid>
            </>
          ) : null}
        </>
      ) : (
        <Grid item xs={12}>
          <FormGroup sx={{ alignItems: 'end' }}>
            <FormControlLabel
              control={<Switch checked={placeReleaseMode} onChange={(e, b) => setPlaceReleaseMode(b)} size={'small'} />}
              label="Place Release Coordinate"
            />
          </FormGroup>
          <Box position="relative" height={350}>
            <MapContainer
              mapId="caputre_form_map"
              scrollWheelZoom={true}
              additionalLayers={[
                <MarkerWithResizableRadius
                  radius={coerceZero(value.capture_coordinate_uncertainty ?? NaN)}
                  position={getCurrentMarkerPos(false)}
                  listenForMouseEvents={!placeReleaseMode}
                  handlePlace={(p) => handleMarkerPlacement(p, placeReleaseMode)}
                  handleResize={(n) => {
                    setFieldValue(
                      getAnimalFieldName<IAnimalCapture>(name, 'capture_coordinate_uncertainty', index),
                      n.toFixed(3)
                    );
                  }}
                />,
                <MarkerWithResizableRadius
                  radius={coerceZero(value.release_coordinate_uncertainty ?? NaN)}
                  position={getCurrentMarkerPos(true)}
                  markerColor="green"
                  listenForMouseEvents={placeReleaseMode}
                  handlePlace={(p) => handleMarkerPlacement(p, placeReleaseMode)}
                  handleResize={(n) => {
                    setFieldValue(
                      getAnimalFieldName<IAnimalCapture>(name, 'release_coordinate_uncertainty', index),
                      n.toFixed(3)
                    );
                  }}
                />
              ]}
            />
          </Box>
        </Grid>
      )}
    </>
  );
};

export default CaptureAnimalForm;
