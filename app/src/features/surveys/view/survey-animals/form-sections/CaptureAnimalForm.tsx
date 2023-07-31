import { Box, Checkbox, FormControlLabel, FormGroup, Grid, Switch, Tab, Tabs } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { MarkerWithResizableRadius } from 'components/map/components/MarkerWithResizableRadius';
import MapContainer from 'components/map/MapContainer';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, FormikErrors, useFormikContext } from 'formik';
import { LatLng } from 'leaflet';
import proj4 from 'proj4';
import { useState } from 'react';
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
    capture_coordinate_uncertainty: 1,
    capture_timestamp: '' as unknown as Date,
    release_latitude: '' as unknown as number,
    release_longitude: '' as unknown as number,
    release_comment: '',
    release_timestamp: '' as unknown as Date,
    release_coordinate_uncertainty: 1,
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

  const getUtmAsLatLng = (northing: number, easting: number) => {
    const utmProjection = `+proj=utm +zone=${10} +north +datum=WGS84 +units=m +no_defs`;
    const wgs84Projection = `+proj=longlat +datum=WGS84 +no_defs`;
    return proj4(utmProjection, wgs84Projection, [Number(easting), Number(northing)]).map((a) => Number(a.toFixed(3)));
  };

  const getLatLngAsUtm = (lat: number, lng: number) => {
    const utmProjection = `+proj=utm +zone=${10} +north +datum=WGS84 +units=m +no_defs`;
    const wgs84Projection = `+proj=longlat +datum=WGS84 +no_defs`;
    return proj4(wgs84Projection, utmProjection, [Number(lng), Number(lat)]).map((a) => Number(a.toFixed(3)));
  };

  const getCurrentMarkerPos = (): LatLng => {
    if (value.projection_mode === 'utm') {
      const latlng_coords = getUtmAsLatLng(
        coerceZero(value.capture_utm_northing),
        coerceZero(value.capture_utm_easting)
      );
      return new LatLng(latlng_coords[1], latlng_coords[0]);
    } else {
      return new LatLng(coerceZero(value.capture_latitude), coerceZero(value.capture_longitude));
    }
  };

  return (
    <>
      <Grid item xs={6}>
        <Tabs
          value={tabState}
          onChange={(e, newVal) => {
            setTabState(newVal);
          }}>
          <Tab label="Forms" />
          <Tab label="Map" />
        </Tabs>
      </Grid>
      <Grid item xs={6}>
        <FormGroup sx={{ alignItems: 'end' }}>
          <FormControlLabel
            control={
              <Switch
                checked={value.projection_mode === 'utm'}
                onChange={async (e) => {
                  if (value.projection_mode === 'wgs') {
                    const utm_coords = getLatLngAsUtm(value.capture_latitude, value.capture_longitude);
                    setFieldValue(
                      getAnimalFieldName<IAnimalCapture>(name, 'capture_utm_northing', index),
                      utm_coords[1]
                    );
                    setFieldValue(
                      getAnimalFieldName<IAnimalCapture>(name, 'capture_utm_easting', index),
                      utm_coords[0]
                    );
                  } else {
                    const wgs_coords = getUtmAsLatLng(
                      coerceZero(value.capture_utm_northing),
                      coerceZero(value.capture_utm_easting)
                    );
                    setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'capture_latitude', index), wgs_coords[1]);
                    setFieldValue(getAnimalFieldName<IAnimalCapture>(name, 'capture_longitude', index), wgs_coords[0]);
                  }
                  setFieldValue(
                    getAnimalFieldName<IAnimalCapture>(name, 'projection_mode', index),
                    e.target.checked ? 'utm' : 'wgs'
                  );
                }}
                size={'small'}
              />
            }
            label="UTM Coordinates"
          />
        </FormGroup>
      </Grid>
      {tabState === 0 ? (
        <>
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
        </>
      ) : (
        <Grid item xs={12}>
          <Box position="relative" height={500}>
            <MapContainer
              mapId="caputre_form_map"
              scrollWheelZoom={true}
              additionalLayers={[
                <MarkerWithResizableRadius
                  radius={coerceZero(value.capture_coordinate_uncertainty ?? NaN)}
                  position={getCurrentMarkerPos()}
                  handlePlace={async (e) => {
                    setFieldValue(
                      getAnimalFieldName<IAnimalCapture>(name, 'capture_latitude', index),
                      e.lat.toFixed(3)
                    );
                    setFieldValue(
                      getAnimalFieldName<IAnimalCapture>(name, 'capture_longitude', index),
                      e.lng.toFixed(3)
                    );
                    const utm_coords = getLatLngAsUtm(e.lat, e.lng);
                    setFieldValue(
                      getAnimalFieldName<IAnimalCapture>(name, 'capture_utm_northing', index),
                      utm_coords[1]
                    );
                    setFieldValue(
                      getAnimalFieldName<IAnimalCapture>(name, 'capture_utm_easting', index),
                      utm_coords[0]
                    );
                  }}
                  handleResize={(n) => {
                    setFieldValue(
                      getAnimalFieldName<IAnimalCapture>(name, 'capture_coordinate_uncertainty', index),
                      n.toFixed(3)
                    );
                  }}
                />
              ]}
            />
          </Box>
        </Grid>
      )}
      {showRelease ? (
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
  );
};

export default CaptureAnimalForm;
