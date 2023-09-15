import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MapBoundary from 'components/boundary/MapBoundary';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';

const SurveySamplingSiteImportForm = () => {
  const formikProps = useFormikContext<any>();
  const [features, setFeatures] = useState<any[]>([]);
  useEffect(() => {
    setFeatures([]);
  }, []);
  return (
    <>
      <Box component="fieldset">
        <Typography component="legend">Import Spatial File</Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            maxWidth: '72ch'
          }}>
          Import a file
        </Typography>
        <MapBoundary
          name="site.geojson"
          title={`Site Boundary Preview ` + (features.length > 0 ? `(${features.length}) boundaries detected` : '')}
          mapId="study_area_form_map"
          bounds={undefined}
          formikProps={formikProps}
        />
      </Box>
    </>
  );
};

export default SurveySamplingSiteImportForm;
