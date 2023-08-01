import { Box, Button } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import FloatingPointField from 'components/fields/FloatingPointField';
import { MarkerWithResizableRadius } from 'components/map/components/MarkerWithResizableRadius';
import MapContainer, { INonEditableGeometries } from 'components/map/MapContainer';
import { Formik, FormikHelpers, FormikValues } from 'formik';
import { LatLng } from 'leaflet';
// import { Circle } from 'react-leaflet';
// import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
// import useDataLoader from 'hooks/useDataLoader';
// import useKeycloakWrapper from "hooks/useKeycloakWrapper";

export const Playground = () => {
  const obtainNonEditableGeometries = (latitude: number, longitude: number): INonEditableGeometries[] => {
    if (!isNaN(latitude) && !isNaN(longitude)) {
      return [
        {
          feature: {
            type: 'Feature',
            id: 'nonEditableGeo',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            properties: {
              name: 'Biodiversity Land'
            }
          }
        }
      ];
    } else {
      return [];
    }
  };

  const coerceZero = (n: number) => (isNaN(n) ? 0 : n);

  return (
    <Formik
      initialValues={{ colour: '7a516697-c7ee-43b3-9e17-2fc31572d819' }}
      onSubmit={function (values: FormikValues, formikHelpers: FormikHelpers<FormikValues>): void | Promise<any> {
        console.log(`Values in Formik on submit: ${JSON.stringify(values, null, 2)}`);
      }}>
      {(formikProps) => {
        return (
          <>
            <Box marginTop={'60px'} maxWidth={'300px'}>
              <CbSelectField name={'colour'} label={'COLOUR'} id={'colour'} route={'colours'} />
              <CbSelectField name={'sex'} label={'SEX'} id={'sex'} route={'sex'} />
              <CbSelectField name={'marking_type'} label={'MARKING TYPE'} id={'marking_type'} route={'marking_type'} />
              <CbSelectField name={'species'} label={'SPECIES'} id={'species'} route={'species'} />
              <CbSelectField
                name={'taxon_collection_categories'}
                label={'COLLECTIONS'}
                id={'taxon_collection_categories'}
                route={'taxon_collection_categories'}
              />
              <Button color="primary" variant="contained" onClick={formikProps.submitForm}>
                Submit
              </Button>
            </Box>
            <Box maxWidth={'300px'}>
              <FloatingPointField
                id={'latitude'}
                label={'latitude'}
                name={'latitude'}
                min={-90}
                max={90}></FloatingPointField>
              <FloatingPointField
                id={'longitude'}
                label={'longitude'}
                name={'longitude'}
                min={-180}
                max={180}></FloatingPointField>
              <FloatingPointField
                id={'coord-un'}
                label={'coordinate uncertainty'}
                name={'coordinate_uncertainty'}></FloatingPointField>
            </Box>
            <Box position="relative" height={500} width={600}>
              <MapContainer
                mapId="playground_map"
                scrollWheelZoom={true}
                nonEditableGeometries={obtainNonEditableGeometries(
                  formikProps.values.latitude ?? 0,
                  formikProps.values.longitude ?? 0
                )}
                additionalLayers={[
                  <MarkerWithResizableRadius
                  listenForMouseEvents={true}
                    radius={coerceZero(formikProps.values.coordinate_uncertainty)}
                    position={
                      new LatLng(coerceZero(formikProps.values.latitude), coerceZero(formikProps.values.longitude))
                    }
                    handlePlace={(e) => {
                      formikProps.setFieldValue('latitude', e.lat);
                      formikProps.setFieldValue('longitude', e.lng);
                    }}
                    handleResize={(n) => {
                      formikProps.setFieldValue('coordinate_uncertainty', n);
                    }}
                  />
                ]}
              />
            </Box>
          </>
        );
      }}
    </Formik>
  );
};
