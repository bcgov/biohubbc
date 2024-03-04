import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';

export interface IProjectAgreementsForm {
  agreements: {
    agreements: string;
  };
}

/**
 * Create project - Agreements section
 *
 * @return {*}
 */
const ProjectAgreementsForm = () => {
  const formikProps = useFormikContext<IProjectAgreementsForm>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box component="fieldset">
            <Typography component="legend">Agreements</Typography>
            <Typography variant="body1" color="textSecondary">
              If you don&apos;t have an agreement, start by creating a draft agreement.
            </Typography>
            <Box mt={3}>
              <CustomTextField
                name="agreements.agreements"
                label="Agreement ID"
                other={{ multiline: true, required: false, rows: 1 }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectAgreementsForm;
