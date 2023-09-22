import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MapBoundary from 'components/boundary/MapBoundary';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from '../observations/sampling-sites/SamplingSitePage';

const SurveySamplingSiteImportForm = () => {
  const formikProps = useFormikContext<ICreateSamplingSiteRequest>();

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
          name="survey_sample_sites"
          title={
            `Site Boundary Preview ` +
            (formikProps.values.survey_sample_sites.length > 0
              ? `(${formikProps.values.survey_sample_sites.length}) boundaries detected`
              : '')
          }
          mapId="study_area_form_map"
          bounds={undefined}
          formikProps={formikProps}
        />
      </Box>
    </>
  );
};

export default SurveySamplingSiteImportForm;
