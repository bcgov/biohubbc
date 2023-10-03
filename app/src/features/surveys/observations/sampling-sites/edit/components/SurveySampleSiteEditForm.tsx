import { CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';
import SamplingSiteMapControl from '../../components/SamplingSiteMapControl';
import { IEditSamplingSiteRequest } from './SampleSiteEditForm';

const SurveySamplingSiteEditForm = () => {
  const formikProps = useFormikContext<IEditSamplingSiteRequest>();

  if (!formikProps.values.sampleSite.survey_sample_sites.length) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

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
          Shapefiles must be compressed into a single zip file. They can include one or more sampling site locations.
        </Typography>
        <SamplingSiteMapControl
          name="sampleSite.survey_sample_sites"
          title={`Site Boundary Preview `}
          mapId="study_area_form_map"
          formikProps={formikProps}
        />
      </Box>
    </>
  );
};

export default SurveySamplingSiteEditForm;
