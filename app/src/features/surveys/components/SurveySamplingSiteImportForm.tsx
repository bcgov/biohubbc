import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SamplingSiteMapControl from 'features/surveys/observations/sampling-sites/components/SamplingSiteMapControl';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from '../observations/sampling-sites/SamplingSitePage';

const SurveySamplingSiteImportForm = () => {
  const formikProps = useFormikContext<ICreateSamplingSiteRequest>();

  return (
    <>
      <Box component="fieldset">
        <Typography
          variant="h3"
          component="h2"
          sx={{
            marginBottom: '14px'
          }}>
          Import Spatial File
        </Typography>
        <SamplingSiteMapControl
          name="survey_sample_sites"
          title={
            `Site Boundary Preview ` +
            (formikProps.values.survey_sample_sites.length > 0
              ? `(${formikProps.values.survey_sample_sites.length}) sampling sites founds`
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
