import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SamplingSiteMapControl from 'features/surveys/sampling-information/sites/components/map/SamplingSiteMapControl';
import { useFormikContext } from 'formik';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';

/**
 * Renders the sampling site import form.
 *
 * @returns {*}
 */
export const SampleSiteImportForm = () => {
  const formikProps = useFormikContext<ICreateSamplingSiteRequest>();

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
      <SamplingSiteMapControl name="survey_sample_sites" mapId="study_area_form_map" formikProps={formikProps} />
    </Box>
  );
};
