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
        <Typography component="legend">Import Spatial File</Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            maxWidth: '92ch'
          }}>
          Before importing, ensure your shapefile is compressed into a single zip file. Shapefiles can include one or
          more sampling site locations.
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
          formikProps={formikProps}
        />
      </Box>
    </>
  );
};

export default SurveySamplingSiteImportForm;
