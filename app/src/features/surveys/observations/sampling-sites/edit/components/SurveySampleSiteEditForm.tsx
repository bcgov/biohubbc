import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';
import { IEditSamplingSiteRequest } from './SampleSiteEditForm';
import SamplingSiteEditMapControl from './SamplingSiteEditMapControl';

const SurveySamplingSiteEditForm = () => {
  const formikProps = useFormikContext<IEditSamplingSiteRequest>();

  if (!formikProps.values.sampleSite.survey_sample_sites.length) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box component="fieldset">
      <Typography component="legend">Import Spatial File</Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          maxWidth: '92ch'
        }}>
        Shapefiles must be compressed into a single zip file. They can include one or more sampling site locations.
      </Typography>
      <SamplingSiteEditMapControl
        name="sampleSite.survey_sample_sites"
        mapId="study_area_form_map"
        formikProps={formikProps}
      />
    </Box>
  );
};

export default SurveySamplingSiteEditForm;
