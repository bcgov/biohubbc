import { Box, FormControlLabel, FormGroup, Grid, Switch, Tab, Tabs } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { MarkerWithResizableRadius } from 'components/map/components/MarkerWithResizableRadius';
import MapContainer from 'components/map/MapContainer';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, FormikErrors, useFormikContext } from 'formik';
import { LatLng } from 'leaflet';
import proj4 from 'proj4';
import { ChangeEvent, useState } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalMortality } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';

type ProjectionMode = 'wgs' | 'utm';
const MortalityAnimalForm = () => {
  const { values, setFieldValue } = useFormikContext<IAnimal>();

  const name: keyof IAnimal = 'mortality';
  const newMortality: IAnimalMortality = {
    mortality_longitude: '' as unknown as number,
    mortality_latitude: '' as unknown as number,
    mortality_utm_northing: '' as unknown as number,
    mortality_utm_easting: '' as unknown as number,
    mortality_timestamp: '' as unknown as Date,
    mortality_coordinate_uncertainty: 1,
    mortality_comment: '',
    mortality_pcod_reason: '',
    mortality_pcod_confidence: '',
    mortality_pcod_taxon_id: '',
    mortality_ucod_reason: '',
    mortality_ucod_confidence: '',
    mortality_ucod_taxon_id: '',
    projection_mode: 'wgs' as ProjectionMode
  };

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalMortalityTitle}
            titleHelp={SurveyAnimalsI18N.animalMortalityHelp}
            btnLabel={SurveyAnimalsI18N.animalMortalityAddBtn}
            maxSections={1}
            handleAddSection={() => push(newMortality)}
            handleRemoveSection={remove}>
            {values.mortality.map((_cap, index) => (
              <MortalityAnimalFormContent
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

interface MortalityAnimalFormContentProps {
  name: keyof IAnimal;
  index: number;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<any>>;
  value: IAnimalMortality;
}

const coerceZero = (n: number | undefined): number => (isNaN(n ?? NaN) ? 0 : Number(n));

const MortalityAnimalFormContent = ({ name, index, setFieldValue, value }: MortalityAnimalFormContentProps) => {
  const [tabState, setTabState] = useState(0);
  const [pcodTaxonDisabled, setPcodTaxonDisabled] = useState(true);
  const [ucodTaxonDisabled, setUcodTaxonDisabled] = useState(true);

  const utmProjection = `+proj=utm +zone=${10} +north +datum=WGS84 +units=m +no_defs`;
  const wgs84Projection = `+proj=longlat +datum=WGS84 +no_defs`;

  const getUtmAsLatLng = (northing: number, easting: number) => {
    return proj4(utmProjection, wgs84Projection, [Number(easting), Number(northing)]).map((a) => Number(a.toFixed(3)));
  };

  const getLatLngAsUtm = (lat: number, lng: number) => {
    return proj4(wgs84Projection, utmProjection, [Number(lng), Number(lat)]).map((a) => Number(a.toFixed(3)));
  };

  const handleMarkerPlacement = (e: LatLng) => {
    setFieldValue(getAnimalFieldName<IAnimalMortality>(name, 'mortality_latitude', index), e.lat.toFixed(3));
    setFieldValue(getAnimalFieldName<IAnimalMortality>(name, 'mortality_longitude', index), e.lng.toFixed(3));
    const utm_coords = getLatLngAsUtm(e.lat, e.lng);
    setFieldValue(getAnimalFieldName<IAnimalMortality>(name, 'mortality_utm_northing', index), utm_coords[1]);
    setFieldValue(getAnimalFieldName<IAnimalMortality>(name, 'mortality_utm_easting', index), utm_coords[0]);
  };

  const onProjectionModeSwitch = (e: ChangeEvent<HTMLInputElement>, isRelease: boolean) => {
    if (value.projection_mode === 'wgs') {
      const utm_coords = getLatLngAsUtm(value.mortality_latitude, value.mortality_longitude);
      setFieldValue(getAnimalFieldName<IAnimalMortality>(name, 'mortality_utm_northing', index), utm_coords[1]);
      setFieldValue(getAnimalFieldName<IAnimalMortality>(name, 'mortality_utm_easting', index), utm_coords[0]);
    } else {
      const wgs_coords = getUtmAsLatLng(
        coerceZero(value.mortality_utm_northing),
        coerceZero(value.mortality_utm_easting)
      );
      setFieldValue(getAnimalFieldName<IAnimalMortality>(name, 'mortality_latitude', index), wgs_coords[1]);
      setFieldValue(getAnimalFieldName<IAnimalMortality>(name, 'mortality_longitude', index), wgs_coords[0]);
    }
    setFieldValue(
      getAnimalFieldName<IAnimalMortality>(name, 'projection_mode', index),
      e.target.checked ? 'utm' : 'wgs'
    );
  };

  const getCurrentMarkerPos = (): LatLng => {
    if (value.projection_mode === 'utm') {
      const latlng_coords = getUtmAsLatLng(
        coerceZero(value.mortality_utm_northing),
        coerceZero(value.mortality_utm_easting)
      );
      return new LatLng(latlng_coords[1], latlng_coords[0]);
    } else {
      return new LatLng(coerceZero(value.mortality_latitude), coerceZero(value.mortality_longitude));
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
          {value.projection_mode === 'wgs' ? (
            <>
              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Mortality Latitude"
                  name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_latitude', index)}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Mortality Longitude"
                  name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_longitude', index)}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Mortality UTM Northing"
                  name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_utm_northing', index)}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  other={{ required: true, size: 'small' }}
                  label="Mortality UTM Easting"
                  name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_utm_easting', index)}
                />
              </Grid>
            </>
          )}

          <Grid item xs={6}>
            <CustomTextField
              other={{ required: true, size: 'small' }}
              label="Mortality Coordinate Uncertainty"
              name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_coordinate_uncertainty', index)}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              other={{ required: true, size: 'small' }}
              label="Temp Mortality Timestamp"
              name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_timestamp', index)}
            />
          </Grid>
          <Grid item xs={6}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_pcod_reason', index)}
              handleChangeSideEffect={(value, label) => setPcodTaxonDisabled(!label.includes('Predation'))}
              label={'PCOD Reason'}
              controlProps={{ size: 'small' }}
              id={`${index}-pcod-reason`}
              route={'cod'}
            />
          </Grid>
          <Grid item xs={3}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_pcod_confidence', index)}
              label={'PCOD Confidence'}
              controlProps={{ size: 'small' }}
              id={`${index}-pcod-confidence`}
              route={'cause_of_death_confidence'}
            />
          </Grid>
          <Grid item xs={3}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_pcod_taxon_id', index)}
              label={'PCOD Taxon'}
              controlProps={{ size: 'small', disabled: pcodTaxonDisabled }}
              id={`${index}-pcod-taxon`}
              route={'taxons'}
            />
          </Grid>
          <Grid item xs={6}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_ucod_reason', index)}
              handleChangeSideEffect={(value, label) => {
                setUcodTaxonDisabled(!label.includes('Predation'));
              }}
              label={'UCOD Reason'}
              controlProps={{ size: 'small' }}
              id={`${index}-ucod-reason`}
              route={'cod'}
            />
          </Grid>
          <Grid item xs={3}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_ucod_confidence', index)}
              label={'UCOD Confidence'}
              controlProps={{ size: 'small' }}
              id={`${index}-ucod-confidence`}
              route={'cause_of_death_confidence'}
            />
          </Grid>
          <Grid item xs={3}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_ucod_taxon_id', index)}
              label={'UCOD Taxon'}
              controlProps={{ size: 'small', disabled: ucodTaxonDisabled }}
              id={`${index}-ucod-taxon`}
              route={'taxons'}
            />
          </Grid>
          <Grid item xs={6}>
            <TextInputToggle label="Add comment about this Mortality">
              <CustomTextField
                other={{ required: true, size: 'small' }}
                label="Mortality Comment"
                name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_comment', index)}
              />
            </TextInputToggle>
          </Grid>
        </>
      ) : (
        <Grid item xs={12}>
          <Box position="relative" height={500}>
            <MapContainer
              mapId="mortality_form_map"
              scrollWheelZoom={true}
              additionalLayers={[
                <MarkerWithResizableRadius
                  radius={coerceZero(value.mortality_coordinate_uncertainty ?? NaN)}
                  position={getCurrentMarkerPos()}
                  markerColor="red"
                  listenForMouseEvents={true}
                  handlePlace={handleMarkerPlacement}
                  handleResize={(n) => {
                    setFieldValue(
                      getAnimalFieldName<IAnimalMortality>(name, 'mortality_coordinate_uncertainty', index),
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

export default MortalityAnimalForm;
