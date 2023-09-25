import { LoadingButton } from '@mui/lab';
import { Breadcrumbs, Button, Link, Paper, Theme, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import { useFormikContext } from 'formik';
import { useHistory } from 'react-router';
import { ICreateSamplingSiteRequest } from './SamplingSitePage';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

export interface ISamplingSiteHeaderProps {
  project_id: number;
  survey_id: number;
  survey_name: string;
  is_submitting: boolean;
}
export const SamplingSiteHeader: React.FC<ISamplingSiteHeaderProps> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const formikProps = useFormikContext<ICreateSamplingSiteRequest>();

  const { project_id, survey_id, survey_name, is_submitting } = props;
  return (
    <>
      <Paper
        square
        elevation={0}
        sx={{
          pt: 3,
          pb: 3.5,
          px: 3
        }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 1
          }}>
          <Link
            variant="body2"
            underline="hover"
            href={`/admin/projects/${project_id}/surveys/${survey_id}/details`}>
            {survey_name}
          </Link>
          <Link
            variant="body2"
            href={`/admin/projects/${project_id}/surveys/${survey_id}/observations`}>
            Manage Survey Observations
          </Link>
          <Typography 
            component="span"
            color="text.secondary" 
            variant="body2">
            Add Sampling Sites
          </Typography>
        </Breadcrumbs>
        <Box display="flex" justifyContent='space-between'>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              ml: '-2px'
            }}>
            New Sampling Site
          </Typography>
          <Box>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={is_submitting}
              onClick={() => {
                formikProps.submitForm();
              }}
              className={classes.actionButton}>
              Save and Exit
            </LoadingButton>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                history.push(`/admin/projects/${project_id}/surveys/${survey_id}/observations`);
              }}
              className={classes.actionButton}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default SamplingSiteHeader;
